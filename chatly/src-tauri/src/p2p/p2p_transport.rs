use std::sync::{
    atomic::{AtomicU32, Ordering},
    Arc,
};

use bytes::Bytes;
use iroh::{
    endpoint::{presets, Connection},
    Endpoint, EndpointAddr,
};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;

/// 单独的 ALPN，后续如果你要加 control stream，可以再加一个 control ALPN。
const VOICE_ALPN: &[u8] = b"/zoey/voice/1";

/// 语音包类型。先只保留 Audio，后面可扩展 Fec / ComfortNoise / Dtmf 等。
#[repr(u8)]
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum VoicePayloadType {
    Audio = 0,
}

impl TryFrom<u8> for VoicePayloadType {
    type Error = String;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Audio),
            _ => Err(format!("unknown payload type: {}", value)),
        }
    }
}

/// 语音 datagram 包头：
/// - seq: 递增序号，后续前端或 Rust jitter buffer 可用来重排/统计丢包
/// - timestamp_ms: 发送时刻，后续可据此丢弃过期包
/// - payload_type: 先固定 Audio
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoicePacket {
    pub seq: u32,
    pub timestamp_ms: u64,
    pub payload_type: VoicePayloadType,
    pub payload: Vec<u8>,
}

impl VoicePacket {
    /// 自定义极小包头编码：
    /// 4 bytes seq
    /// 8 bytes timestamp_ms
    /// 1 byte payload_type
    /// N bytes payload
    pub fn encode(&self) -> Vec<u8> {
        let mut out = Vec::with_capacity(13 + self.payload.len());
        out.extend_from_slice(&self.seq.to_be_bytes());
        out.extend_from_slice(&self.timestamp_ms.to_be_bytes());
        out.push(self.payload_type as u8);
        out.extend_from_slice(&self.payload);
        out
    }

    pub fn decode(buf: &[u8]) -> Result<Self, String> {
        if buf.len() < 13 {
            return Err(format!("voice packet too short: {}", buf.len()));
        }

        let seq = u32::from_be_bytes([buf[0], buf[1], buf[2], buf[3]]);
        let timestamp_ms = u64::from_be_bytes([
            buf[4], buf[5], buf[6], buf[7], buf[8], buf[9], buf[10], buf[11],
        ]);
        let payload_type = VoicePayloadType::try_from(buf[12])?;
        let payload = buf[13..].to_vec();

        Ok(Self {
            seq,
            timestamp_ms,
            payload_type,
            payload,
        })
    }
}

pub struct P2PState {
    pub endpoint: Arc<Mutex<Option<Endpoint>>>,
    pub connection: Arc<Mutex<Option<Connection>>>,
    pub local_addr_json: Arc<Mutex<Option<String>>>,
    pub app: Arc<Mutex<Option<AppHandle>>>,
    pub started: Arc<Mutex<bool>>,
    pub accept_task: Arc<Mutex<Option<tauri::async_runtime::JoinHandle<()>>>>,
    pub recv_task: Arc<Mutex<Option<tauri::async_runtime::JoinHandle<()>>>>,
    pub send_seq: Arc<AtomicU32>,
}

impl Default for P2PState {
    fn default() -> Self {
        Self {
            endpoint: Arc::new(Mutex::new(None)),
            connection: Arc::new(Mutex::new(None)),
            local_addr_json: Arc::new(Mutex::new(None)),
            app: Arc::new(Mutex::new(None)),
            started: Arc::new(Mutex::new(false)),
            accept_task: Arc::new(Mutex::new(None)),
            recv_task: Arc::new(Mutex::new(None)),
            send_seq: Arc::new(AtomicU32::new(1)),
        }
    }
}

impl Clone for P2PState {
    fn clone(&self) -> Self {
        Self {
            endpoint: self.endpoint.clone(),
            connection: self.connection.clone(),
            local_addr_json: self.local_addr_json.clone(),
            app: self.app.clone(),
            started: self.started.clone(),
            accept_task: self.accept_task.clone(),
            recv_task: self.recv_task.clone(),
            send_seq: self.send_seq.clone(),
        }
    }
}

impl P2PState {
    /// 初始化本地 Iroh endpoint。
    /// 这一步会：
    /// 1. 创建 endpoint
    /// 2. 导出可分享给对端的 EndpointAddr JSON
    /// 3. 启动 accept loop
    pub async fn init(&self, app: AppHandle) -> Result<(), String> {
        {
            let started = self.started.lock().await;
            if *started {
                return Ok(());
            }
        }

        {
            let mut app_guard = self.app.lock().await;
            *app_guard = Some(app);
        }

        // Iroh 的 Endpoint 是主入口。
        // 只接受配置的 ALPN。
        let endpoint = Endpoint::builder(presets::N0)
            .alpns(vec![VOICE_ALPN.to_vec()])
            .bind()
            .await
            .map_err(|e| format!("bind endpoint failed: {e}"))?;

        // 文档建议：如果希望 EndpointAddr 足够可拨号，先 online 再 addr。
        endpoint.online().await;

        let addr = endpoint.addr();
        let addr_json =
            serde_json::to_string_pretty(&addr).map_err(|e| format!("addr json failed: {e}"))?;

        {
            let mut guard = self.local_addr_json.lock().await;
            *guard = Some(addr_json.clone());
        }

        {
            let mut guard = self.endpoint.lock().await;
            *guard = Some(endpoint.clone());
        }

        self.start_accept_loop(endpoint).await;

        {
            let mut started = self.started.lock().await;
            *started = true;
        }

        emit_log_arc(
            &self.app,
            format!("iroh ready: id={} local_addr_json prepared", addr.id),
        )
        .await;
        emit_event_arc(&self.app, "p2p-ready", true).await;
        emit_event_arc(&self.app, "p2p-local-addr", addr_json).await;

        Ok(())
    }

    /// 给 UI 直接取本地地址 JSON。
    pub async fn get_local_addr_json(&self) -> Result<String, String> {
        self.local_addr_json
            .lock()
            .await
            .clone()
            .ok_or_else(|| "local addr not initialized".to_string())
    }

    /// 通过对端导出的 EndpointAddr JSON 建连。
    pub async fn dial(&self, addr_json: String) -> Result<(), String> {
        let endpoint = self
            .endpoint
            .lock()
            .await
            .clone()
            .ok_or_else(|| "p2p not initialized".to_string())?;

        let remote_addr: EndpointAddr =
            serde_json::from_str(&addr_json).map_err(|e| format!("invalid addr json: {e}"))?;

        emit_log_arc(
            &self.app,
            format!("dialing remote endpoint: {}", remote_addr.id),
        )
        .await;

        let conn = endpoint
            .connect(remote_addr, VOICE_ALPN)
            .await
            .map_err(|e| format!("connect failed: {e}"))?;

        emit_log_arc(
            &self.app,
            format!("connected (outgoing): {}", conn.remote_id()),
        )
        .await;

        self.set_connection(conn).await
    }

    /// 发送原始音频帧。
    /// 这里会自动封装成 VoicePacket，再走 datagram 发出。
    pub async fn send(&self, audio_payload: Vec<u8>) -> Result<(), String> {
        let conn = self
            .connection
            .lock()
            .await
            .clone()
            .ok_or_else(|| "connection not established".to_string())?;

        let seq = self.send_seq.fetch_add(1, Ordering::Relaxed);
        let timestamp_ms = now_ms();

        let pkt = VoicePacket {
            seq,
            timestamp_ms,
            payload_type: VoicePayloadType::Audio,
            payload: audio_payload,
        };

        let encoded = pkt.encode();

        let max = conn
            .max_datagram_size()
            .ok_or_else(|| "peer does not support QUIC datagrams".to_string())?;

        if encoded.len() > max {
            return Err(format!(
                "voice packet too large for datagram: {} > {}",
                encoded.len(),
                max
            ));
        }

        conn.send_datagram(Bytes::from(encoded))
            .map_err(|e| format!("send datagram failed: {e}"))
    }

    pub async fn close(&self) -> Result<(), String> {
        {
            let mut guard = self.accept_task.lock().await;
            if let Some(task) = guard.take() {
                task.abort();
            }
        }

        {
            let mut guard = self.recv_task.lock().await;
            if let Some(task) = guard.take() {
                task.abort();
            }
        }

        {
            let mut guard = self.connection.lock().await;
            if let Some(conn) = guard.take() {
                conn.close(0u32.into(), b"closed");
            }
        }

        {
            let mut guard = self.endpoint.lock().await;
            if let Some(endpoint) = guard.take() {
                endpoint.close().await;
            }
        }

        {
            let mut guard = self.local_addr_json.lock().await;
            *guard = None;
        }

        self.send_seq.store(1, Ordering::Relaxed);

        {
            let mut started = self.started.lock().await;
            *started = false;
        }

        emit_log_arc(&self.app, "p2p closed".to_string()).await;
        emit_event_arc(&self.app, "p2p-closed", true).await;

        Ok(())
    }

    async fn set_connection(&self, conn: Connection) -> Result<(), String> {
        // 停掉旧接收循环
        {
            let mut recv_guard = self.recv_task.lock().await;
            if let Some(task) = recv_guard.take() {
                task.abort();
            }
        }

        // 替换旧连接
        {
            let mut conn_guard = self.connection.lock().await;
            if let Some(old) = conn_guard.replace(conn.clone()) {
                old.close(0u32.into(), b"replaced");
            }
        }

        emit_event_arc(
            &self.app,
            "p2p-connected",
            conn.remote_id().to_string(),
        )
        .await;

        emit_log_arc(
            &self.app,
            format!("active connection set: {}", conn.remote_id()),
        )
        .await;

        self.start_recv_loop(conn).await;
        Ok(())
    }

    async fn start_accept_loop(&self, endpoint: Endpoint) {
        let state = self.clone();

        let task = tauri::async_runtime::spawn(async move {
            loop {
                let Some(incoming) = endpoint.accept().await else {
                    emit_log_arc(&state.app, "accept loop ended".to_string()).await;
                    break;
                };

                match incoming.await {
                    Ok(conn) => {
                        emit_log_arc(
                            &state.app,
                            format!("connected (incoming): {}", conn.remote_id()),
                        )
                        .await;

                        if let Err(e) = state.set_connection(conn).await {
                            emit_log_arc(&state.app, format!("set_connection error: {}", e)).await;
                        }
                    }
                    Err(e) => {
                        emit_log_arc(&state.app, format!("incoming connection error: {}", e)).await;
                    }
                }
            }
        });

        let mut guard = self.accept_task.lock().await;
        if let Some(old) = guard.take() {
            old.abort();
        }
        *guard = Some(task);
    }

    async fn start_recv_loop(&self, conn: Connection) {
        let state = self.clone();

        let task = tauri::async_runtime::spawn(async move {
            loop {
                match conn.read_datagram().await {
                    Ok(bytes) => match VoicePacket::decode(&bytes) {
                        Ok(pkt) => {
                            // 兼容你原来的前端事件：直接把 payload 发出去
                            emit_event_arc(&state.app, "p2p-data", pkt.payload.clone()).await;

                            // 增加一个更适合调试语音质量的事件
                            emit_event_arc(&state.app, "p2p-packet", pkt).await;
                        }
                        Err(e) => {
                            emit_log_arc(&state.app, format!("decode voice packet error: {}", e)).await;
                        }
                    },
                    Err(e) => {
                        emit_log_arc(
                            &state.app,
                            format!("datagram receive error [{}]: {}", conn.remote_id(), e),
                        )
                        .await;
                        break;
                    }
                }
            }
        });

        let mut guard = self.recv_task.lock().await;
        if let Some(old) = guard.take() {
            old.abort();
        }
        *guard = Some(task);
    }
}

fn now_ms() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};

    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

async fn emit_log_arc(app: &Arc<Mutex<Option<AppHandle>>>, msg: String) {
    emit_event_arc(app, "p2p-log", msg).await;
}

async fn emit_event_arc<S>(app: &Arc<Mutex<Option<AppHandle>>>, event: &str, payload: S)
where
    S: serde::Serialize + Clone,
{
    if let Some(app) = app.lock().await.clone() {
        let _ = app.emit(event, payload);
    }
}