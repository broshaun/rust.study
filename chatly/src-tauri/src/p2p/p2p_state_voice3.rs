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

// =========================
// 接收侧缓冲参数
// =========================

// 接收队列最大长度，超过后开始强制裁剪
const MAX_QUEUE_FRAMES: usize = 24;

// 正常目标缓冲深度：4 帧 ≈ 40ms
const TARGET_QUEUE_FRAMES: usize = 4;

// 当延迟偏大时，希望追回到的深度：2 帧 ≈ 20ms
const CATCHUP_TO_FRAMES: usize = 2;

// 每个播放 tick 最多丢多少帧，避免一次丢太猛
const MAX_DROP_PER_TICK: usize = 6;

// 入队超限时，优先修剪到这个值
const TRIM_TO_FRAMES: usize = 8;

// =========================
// 静音检测参数
// =========================

// 平均绝对振幅阈值
const SILENCE_THRESHOLD_AVG_ABS: i32 = 250;

// 峰值阈值
const SILENCE_THRESHOLD_PEAK: i16 = 800;

// 上行语音结束后的拖尾帧数
// 20 帧 ≈ 200ms
const TX_HANGOVER_FRAMES: usize = 20;

// 播放端断流时是否补静音帧
// 如果前端播放端要求持续有 PCM 输入，可改为 true
const FILL_SILENCE_ON_UNDERRUN: bool = false;

#[derive(Clone, Debug)]
struct AudioFrame {
    data: Vec<u8>,
    silent: bool,
}

pub struct P2PStateVoice {
    downlink: Mutex<Option<Channel<Vec<u8>>>>,
    rx_queue: Mutex<VecDeque<AudioFrame>>,

    // 发送侧：用于“语音结束后的短时拖尾”
    tx_hangover: Mutex<usize>,
}

impl P2PStateVoice {
    pub fn new() -> Result<Arc<Self>, String> {
        Ok(Arc::new(Self {
            downlink: Mutex::new(None),
            rx_queue: Mutex::new(VecDeque::new()),
            tx_hangover: Mutex::new(0),
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

    /// 上行：前端 PCM -> 若检测到有声音则返回 Some(frame) 供 transport 发送
    /// 静音时返回 None，不发送，从而减少无意义传输
    pub async fn prepare_pcm_frame(&self, pcm_bytes: Vec<u8>) -> Result<Option<Vec<u8>>, String> {
        validate_pcm_frame(&pcm_bytes)?;

        let voiced = is_voiced_frame(&pcm_bytes);
        let mut hangover = self.tx_hangover.lock().await;

        if voiced {
            *hangover = TX_HANGOVER_FRAMES;
            return Ok(Some(pcm_bytes));
        }

        // 即便当前帧静音，如果刚结束说话，也保留少量尾音继续发送
        if *hangover > 0 {
            *hangover -= 1;
            return Ok(Some(pcm_bytes));
        }

        // 真静音：不传输
        Ok(None)
    }

    /// 下行：transport 收到 raw packet（1 帧 PCM）-> 入队
    /// 入队时标记静音属性，供 playout 时追延迟使用
    pub async fn consume_pcm_frame(&self, data: Vec<u8>) -> Result<(), String> {
        validate_pcm_frame(&data)?;

        let silent = !is_voiced_frame(&data);

        let mut q = self.rx_queue.lock().await;
        q.push_back(AudioFrame { data, silent });

        // 队列超限时，优先丢老的静音帧
        if q.len() > MAX_QUEUE_FRAMES {
            trim_queue_prefer_silence(&mut q, TRIM_TO_FRAMES);
        }

        Ok(())
    }

    pub fn start_playout_loop(self: &Arc<Self>) {
        let this = Arc::clone(self);

        tauri::async_runtime::spawn(async move {
            loop {
                sleep(Duration::from_millis(FRAME_DURATION_MS)).await;

                let payload = {
                    let mut q = this.rx_queue.lock().await;

                    // 核心优化：
                    // 如果当前积压偏大，优先利用“队头静音段”来追回延迟
                    catch_up_latency_on_silence(&mut q);

                    match q.pop_front() {
                        Some(frame) => Some(frame.data),
                        None => {
                            if FILL_SILENCE_ON_UNDERRUN {
                                Some(zero_pcm_frame())
                            } else {
                                None
                            }
                        }
                    }
                };

                let Some(payload) = payload else {
                    continue;
                };

                let ch = {
                    let guard = this.downlink.lock().await;
                    guard.clone()
                };

                if let Some(ch) = ch {
                    let _ = ch.send(payload);
                }
            }
        });
    }

    pub async fn close(&self) -> Result<(), String> {
        self.clear_downlink().await;
        self.rx_queue.lock().await.clear();
        *self.tx_hangover.lock().await = 0;
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

/// 轻量级 VAD：
/// 同时看平均绝对振幅和峰值，避免只靠单一指标误判
fn is_voiced_frame(bytes: &[u8]) -> bool {
    let mut sum_abs: i64 = 0;
    let mut peak: i16 = 0;
    let mut count: i64 = 0;

    for chunk in bytes.chunks_exact(2) {
        let sample = i16::from_le_bytes([chunk[0], chunk[1]]);
        let abs = sample.saturating_abs();

        if abs > peak {
            peak = abs;
        }

        sum_abs += abs as i64;
        count += 1;
    }

    if count == 0 {
        return false;
    }

    let avg_abs = (sum_abs / count) as i32;

    avg_abs >= SILENCE_THRESHOLD_AVG_ABS || peak >= SILENCE_THRESHOLD_PEAK
}

/// 队列超限时：
/// 优先丢弃最老的静音帧；如果还不够，再丢最老帧保命
fn trim_queue_prefer_silence(q: &mut VecDeque<AudioFrame>, target_len: usize) {
    if q.len() <= target_len {
        return;
    }

    // 先优先删静音帧
    let mut i = 0;
    while q.len() > target_len && i < q.len() {
        if q[i].silent {
            q.remove(i);
        } else {
            i += 1;
        }
    }

    // 如果删完静音还是太长，只能继续丢最老帧
    while q.len() > target_len {
        q.pop_front();
    }
}

/// 播放前尝试利用“静音段”追延迟：
/// - 队列长度不高：不处理
/// - 队列长度偏高：如果队头是静音，则直接丢弃静音帧
/// - 不会主动切掉队头语音帧
fn catch_up_latency_on_silence(q: &mut VecDeque<AudioFrame>) {
    let len = q.len();

    if len <= TARGET_QUEUE_FRAMES {
        return;
    }

    let need_drop = len
        .saturating_sub(CATCHUP_TO_FRAMES)
        .min(MAX_DROP_PER_TICK);

    if need_drop == 0 {
        return;
    }

    let mut dropped = 0;

    while dropped < need_drop {
        match q.front() {
            Some(frame) if frame.silent => {
                q.pop_front();
                dropped += 1;
            }
            _ => {
                // 队头不是静音，就不硬追，避免切人声
                break;
            }
        }
    }
}

fn zero_pcm_frame() -> Vec<u8> {
    vec![0u8; FRAME_BYTES]
}