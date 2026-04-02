use std::collections::VecDeque;
use std::sync::Arc;
use std::time::Duration;

use tauri::ipc::Channel;
use tokio::sync::Mutex;
use tokio::time::sleep;

const CHANNELS: usize = 1;
const FRAME_SIZE: usize = 480; // 10ms @ 48k
const BYTES_PER_SAMPLE: usize = 2; // i16
const FRAME_BYTES: usize = FRAME_SIZE * CHANNELS * BYTES_PER_SAMPLE; // 960
const FRAME_DURATION_MS: u64 = 10;

// Rust 侧轻量缓冲：
// 太小容易断，太大容易累积延迟。
const MAX_QUEUE_FRAMES: usize = 24;
// 当积压过多时，回落到这个目标值，避免一直高延迟。
const TRIM_TO_FRAMES: usize = 8;

pub struct P2PStateVoice {
    downlink: Mutex<Option<Channel<Vec<u8>>>>,
    rx_queue: Mutex<VecDeque<Vec<u8>>>,
}

impl P2PStateVoice {
    pub fn new() -> Result<Arc<Self>, String> {
        Ok(Arc::new(Self {
            downlink: Mutex::new(None),
            rx_queue: Mutex::new(VecDeque::new()),
        }))
    }

    pub async fn set_downlink(&self, ch: Channel<Vec<u8>>) {
        *self.downlink.lock().await = Some(ch);
    }

    pub async fn clear_downlink(&self) {
        *self.downlink.lock().await = None;
    }

    pub async fn set_voice_downlink_channel(&self, ch: Channel<Vec<u8>>) {
        self.set_downlink(ch).await;
    }

    /// 上行：前端 PCM -> 直接透传到 p2p transport
    pub async fn prepare_pcm_frame(&self, pcm_bytes: Vec<u8>) -> Result<Vec<u8>, String> {
        validate_pcm_frame(&pcm_bytes)?;
        Ok(pcm_bytes)
    }

    /// 下行：transport 收到 raw packet（其实就是一帧 PCM）-> 入队
    pub async fn consume_pcm_frame(&self, data: Vec<u8>) -> Result<(), String> {
        validate_pcm_frame(&data)?;

        let mut q = self.rx_queue.lock().await;
        q.push_back(data);

        if q.len() > MAX_QUEUE_FRAMES {
            while q.len() > TRIM_TO_FRAMES {
                q.pop_front();
            }
        }

        Ok(())
    }

    pub fn start_playout_loop(self: &Arc<Self>) {
        let this = Arc::clone(self);

        tauri::async_runtime::spawn(async move {
            loop {
                sleep(Duration::from_millis(FRAME_DURATION_MS)).await;

                let frame = {
                    let mut q = this.rx_queue.lock().await;
                    q.pop_front()
                };

                let Some(frame) = frame else {
                    continue;
                };

                if let Some(ch) = &*this.downlink.lock().await {
                    let _ = ch.send(frame);
                }
            }
        });
    }

    pub async fn close(&self) -> Result<(), String> {
        self.clear_downlink().await;
        self.rx_queue.lock().await.clear();
        Ok(())
    }
}

fn validate_pcm_frame(bytes: &[u8]) -> Result<(), String> {
    if bytes.len() != FRAME_BYTES {
        return Err(format!(
            "invalid pcm frame bytes: got {}, expected {} (48k mono s16le 10ms)",
            bytes.len(),
            FRAME_BYTES
        ));
    }

    if bytes.len() % 2 != 0 {
        return Err("invalid pcm bytes: odd length".to_string());
    }

    Ok(())
}