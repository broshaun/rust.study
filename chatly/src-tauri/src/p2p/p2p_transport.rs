use std::sync::Arc;

use iroh::{
    endpoint::{presets, Connection, RecvStream, SendStream},
    Endpoint, EndpointAddr,
};
use serde::{Deserialize, Serialize};
use tauri::{ipc::Channel, AppHandle, Emitter};
use tokio::{
    io::{AsyncWriteExt},
    sync::Mutex,
};

const P2P_ALPN: &[u8] = b"/zoey/p2p/1";

#[repr(u8)]
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum P2PDataType {
    Raw = 0,
}

impl TryFrom<u8> for P2PDataType {
    type Error = String;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Raw),
            _ => Err(format!("unknown p2p data type: {}", value)),
        }
    }
}

/// 应用层 framed message:
/// [4 bytes length][1 byte data_type][payload...]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct P2PMessage {
    pub data_type: P2PDataType,
    pub payload: Vec<u8>,
}

impl P2PMessage {
    pub fn encode(&self) -> Vec<u8> {
        let body_len = 1usize + self.payload.len();
        let mut out = Vec::with_capacity(4 + body_len);

        out.extend_from_slice(&(body_len as u32).to_be_bytes());
        out.push(self.data_type as u8);
        out.extend_from_slice(&self.payload);

        out
    }

    pub fn decode_body(body: &[u8]) -> Result<Self, String> {
        if body.is_empty() {
            return Err("p2p message body too short: 0".to_string());
        }

        let data_type = P2PDataType::try_from(body[0])?;
        let payload = body[1..].to_vec();

        Ok(Self { data_type, payload })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct P2PPacketDebug {
    pub data_type: P2PDataType,
    pub payload_len: usize,
}

pub struct P2PState {
    pub endpoint: Arc<Mutex<Option<Endpoint>>>,
    pub connection: Arc<Mutex<Option<Connection>>>,
    pub local_addr_json: Arc<Mutex<Option<String>>>,
    pub app: Arc<Mutex<Option<AppHandle>>>,
    pub started: Arc<Mutex<bool>>,

    pub accept_task: Arc<Mutex<Option<tauri::async_runtime::JoinHandle<()>>>>,
    pub recv_task: Arc<Mutex<Option<tauri::async_runtime::JoinHandle<()>>>>,

    pub send_stream: Arc<Mutex<Option<SendStream>>>,
    pub raw_downlink_channel: Arc<Mutex<Option<Channel<Vec<u8>>>>>,
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
            send_stream: Arc::new(Mutex::new(None)),
            raw_downlink_channel: Arc::new(Mutex::new(None)),
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
            send_stream: self.send_stream.clone(),
            raw_downlink_channel: self.raw_downlink_channel.clone(),
        }
    }
}

impl P2PState {
    pub async fn set_raw_downlink_channel(&self, channel: Channel<Vec<u8>>) {
        let mut ch = self.raw_downlink_channel.lock().await;
        *ch = Some(channel);
    }

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

        let endpoint = Endpoint::builder(presets::N0)
            .alpns(vec![P2P_ALPN.to_vec()])
            .bind()
            .await
            .map_err(|e| format!("bind endpoint failed: {e}"))?;

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

    pub async fn get_local_addr_json(&self) -> Result<String, String> {
        self.local_addr_json
            .lock()
            .await
            .clone()
            .ok_or_else(|| "local addr not initialized".to_string())
    }

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
            .connect(remote_addr, P2P_ALPN)
            .await
            .map_err(|e| format!("connect failed: {e}"))?;

        emit_log_arc(
            &self.app,
            format!("connected (outgoing transport): {}", conn.remote_id()),
        )
        .await;

        self.set_outgoing_connection(conn).await
    }

    pub async fn send(&self, raw_payload: Vec<u8>) -> Result<(), String> {
        let encoded = P2PMessage {
            data_type: P2PDataType::Raw,
            payload: raw_payload,
        }
        .encode();

        let mut guard = self.send_stream.lock().await;
        let send = guard
            .as_mut()
            .ok_or_else(|| "send stream not established yet".to_string())?;

        send.write_all(&encoded)
            .await
            .map_err(|e| format!("stream write failed: {e}"))?;

        send.flush()
            .await
            .map_err(|e| format!("stream flush failed: {e}"))?;

        Ok(())
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
            let mut send_guard = self.send_stream.lock().await;
            if let Some(mut send) = send_guard.take() {
                let _ = send.finish();
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

        {
            let mut started = self.started.lock().await;
            *started = false;
        }

        {
            let mut ch = self.raw_downlink_channel.lock().await;
            *ch = None;
        }

        emit_log_arc(&self.app, "p2p closed".to_string()).await;
        emit_event_arc(&self.app, "p2p-closed", true).await;

        Ok(())
    }

    async fn set_outgoing_connection(&self, conn: Connection) -> Result<(), String> {
        self.clear_active_streams_and_tasks().await;

        {
            let mut conn_guard = self.connection.lock().await;
            if let Some(old) = conn_guard.replace(conn.clone()) {
                old.close(0u32.into(), b"replaced");
            }
        }

        emit_log_arc(
            &self.app,
            format!("opening bi stream (outgoing): {}", conn.remote_id()),
        )
        .await;

        let (send, recv) = conn
            .open_bi()
            .await
            .map_err(|e| format!("open_bi failed: {e}"))?;

        {
            let mut send_guard = self.send_stream.lock().await;
            *send_guard = Some(send);
        }

        self.start_recv_loop(conn.clone(), recv).await;

        emit_event_arc(
            &self.app,
            "p2p-connected",
            conn.remote_id().to_string(),
        )
        .await;
        emit_log_arc(
            &self.app,
            format!("active connection ready (outgoing): {}", conn.remote_id()),
        )
        .await;

        Ok(())
    }

    async fn set_incoming_connection(&self, conn: Connection) -> Result<(), String> {
        self.clear_active_streams_and_tasks().await;

        {
            let mut conn_guard = self.connection.lock().await;
            if let Some(old) = conn_guard.replace(conn.clone()) {
                old.close(0u32.into(), b"replaced");
            }
        }

        emit_log_arc(
            &self.app,
            format!("waiting bi stream (incoming): {}", conn.remote_id()),
        )
        .await;

        let (send, recv) = conn
            .accept_bi()
            .await
            .map_err(|e| format!("accept_bi failed: {e}"))?;

        {
            let mut send_guard = self.send_stream.lock().await;
            *send_guard = Some(send);
        }

        self.start_recv_loop(conn.clone(), recv).await;

        emit_event_arc(
            &self.app,
            "p2p-connected",
            conn.remote_id().to_string(),
        )
        .await;
        emit_log_arc(
            &self.app,
            format!("active connection ready (incoming): {}", conn.remote_id()),
        )
        .await;

        Ok(())
    }

    async fn clear_active_streams_and_tasks(&self) {
        {
            let mut recv_guard = self.recv_task.lock().await;
            if let Some(task) = recv_guard.take() {
                task.abort();
            }
        }

        {
            let mut send_guard = self.send_stream.lock().await;
            if let Some(mut send) = send_guard.take() {
                let _ = send.finish();
            }
        }
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
                            format!("connected (incoming transport): {}", conn.remote_id()),
                        )
                        .await;

                        if let Err(e) = state.set_incoming_connection(conn).await {
                            emit_log_arc(
                                &state.app,
                                format!("set_incoming_connection error: {}", e),
                            )
                            .await;
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

    async fn start_recv_loop(&self, conn: Connection, mut recv: RecvStream) {
        let state = self.clone();

        let task = tauri::async_runtime::spawn(async move {
            loop {
                match read_one_message(&mut recv).await {
                    Ok(msg) => {
                        match msg.data_type {
                            P2PDataType::Raw => {
                                {
                                    let ch = state.raw_downlink_channel.lock().await;
                                    if let Some(channel) = ch.as_ref() {
                                        let _ = channel.send(msg.payload.clone());
                                    }
                                }

                                emit_event_arc(
                                    &state.app,
                                    "p2p-packet",
                                    P2PPacketDebug {
                                        data_type: msg.data_type,
                                        payload_len: msg.payload.len(),
                                    },
                                )
                                .await;
                            }
                        }
                    }
                    Err(e) => {
                        emit_log_arc(
                            &state.app,
                            format!("stream receive error [{}]: {}", conn.remote_id(), e),
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

async fn read_one_message(recv: &mut RecvStream) -> Result<P2PMessage, String> {
    let mut len_buf = [0u8; 4];
    recv.read_exact(&mut len_buf)
        .await
        .map_err(|e| format!("read length prefix failed: {e}"))?;

    let body_len = u32::from_be_bytes(len_buf) as usize;
    if body_len == 0 {
        return Err("invalid message body length: 0".to_string());
    }

    let mut body = vec![0u8; body_len];
    recv.read_exact(&mut body)
        .await
        .map_err(|e| format!("read message body failed: {e}"))?;

    P2PMessage::decode_body(&body)
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