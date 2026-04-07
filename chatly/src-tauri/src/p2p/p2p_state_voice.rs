use std::collections::VecDeque;
use std::sync::Arc;
use std::time::Duration;

use tauri::ipc::Channel;
use tokio::sync::Mutex;
use tokio::time::sleep;

const CHANNELS: usize = 1;
const FRAME_SIZE: usize = 480;
const BYTES_PER_SAMPLE: usize = 2;
const FRAME_BYTES: usize = FRAME_SIZE * CHANNELS * BYTES_PER_SAMPLE;
const FRAME_DURATION_MS: u64 = 10;

// =========================
// Buffer
// =========================

const MAX_QUEUE_FRAMES: usize = 24;
const TARGET_QUEUE_FRAMES: usize = 4;
const CATCHUP_TO_FRAMES: usize = 2;
const MAX_DROP_PER_TICK: usize = 6;
const TRIM_TO_FRAMES: usize = 8;

// =========================
// VAD
// =========================

const SILENCE_THRESHOLD_AVG_ABS: i32 = 250;
const SILENCE_THRESHOLD_PEAK: i32 = 800;
const TX_HANGOVER_FRAMES: usize = 20;

// =========================
// Denoise
// =========================

const NOISE_GATE: i32 = 200;
const FILL_SILENCE_ON_UNDERRUN: bool = false;

#[derive(Clone)]
struct AudioFrame {
    data: Vec<u8>,
    silent: bool,
}

pub struct P2PStateVoice {
    downlink: Mutex<Option<Channel<Vec<u8>>>>,
    rx_queue: Mutex<VecDeque<AudioFrame>>,
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

    /// 上行控制（静音不发）
    pub async fn prepare_pcm_frame(&self, pcm: Vec<u8>) -> Result<Option<Vec<u8>>, String> {
        validate_pcm_frame(&pcm)?;

        let voiced = is_voiced_frame(&pcm);
        let mut hang = self.tx_hangover.lock().await;

        if voiced {
            *hang = TX_HANGOVER_FRAMES;
            return Ok(Some(pcm));
        }

        if *hang > 0 {
            *hang -= 1;
            return Ok(Some(pcm));
        }

        Ok(None)
    }

    /// 下行处理（降噪 + 入队）
    pub async fn consume_pcm_frame(&self, mut data: Vec<u8>) -> Result<(), String> {
        validate_pcm_frame(&data)?;

        // ⭐ 降噪
        denoise_frame(&mut data);

        let silent = !is_voiced_frame(&data);

        let mut q = self.rx_queue.lock().await;
        q.push_back(AudioFrame { data, silent });

        if q.len() > MAX_QUEUE_FRAMES {
            trim_queue(&mut q);
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

                    catch_up(&mut q);

                    match q.pop_front() {
                        Some(f) => Some(f.data),
                        None => {
                            if FILL_SILENCE_ON_UNDERRUN {
                                Some(zero_frame())
                            } else {
                                None
                            }
                        }
                    }
                };

                let Some(payload) = payload else { continue };

                if let Some(ch) = &*this.downlink.lock().await {
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

// =========================
// Utils
// =========================

fn validate_pcm_frame(bytes: &[u8]) -> Result<(), String> {
    if bytes.len() != FRAME_BYTES {
        return Err(format!("invalid frame {}", bytes.len()));
    }
    Ok(())
}

// ⭐ 无溢出 abs
#[inline]
fn abs_i16(sample: i16) -> i32 {
    (sample as i32).abs()
}

// =========================
// VAD
// =========================

fn is_voiced_frame(bytes: &[u8]) -> bool {
    let mut sum = 0i64;
    let mut peak = 0i32;

    for chunk in bytes.chunks_exact(2) {
        let s = i16::from_le_bytes([chunk[0], chunk[1]]);
        let a = abs_i16(s);

        if a > peak {
            peak = a;
        }

        sum += a as i64;
    }

    let avg = (sum / FRAME_SIZE as i64) as i32;

    avg >= SILENCE_THRESHOLD_AVG_ABS || peak >= SILENCE_THRESHOLD_PEAK
}

// =========================
// ⭐ 降噪（轻量实时版）
// =========================

fn denoise_frame(bytes: &mut [u8]) {
    let mut prev = 0i16;

    for chunk in bytes.chunks_exact_mut(2) {
        let s = i16::from_le_bytes([chunk[0], chunk[1]]);
        let abs = abs_i16(s);

        // 1️⃣ 噪声门
        let gated = if abs < NOISE_GATE { 0 } else { s };

        // 2️⃣ 低通滤波（去高频噪声）
        let filtered = ((gated as i32 + prev as i32) / 2) as i16;

        prev = filtered;

        let out = filtered.to_le_bytes();
        chunk[0] = out[0];
        chunk[1] = out[1];
    }
}

// =========================
// Buffer control
// =========================

fn trim_queue(q: &mut VecDeque<AudioFrame>) {
    let mut i = 0;

    while q.len() > TRIM_TO_FRAMES && i < q.len() {
        if q[i].silent {
            q.remove(i);
        } else {
            i += 1;
        }
    }

    while q.len() > TRIM_TO_FRAMES {
        q.pop_front();
    }
}

fn catch_up(q: &mut VecDeque<AudioFrame>) {
    if q.len() <= TARGET_QUEUE_FRAMES {
        return;
    }

    let need = (q.len() - CATCHUP_TO_FRAMES).min(MAX_DROP_PER_TICK);

    let mut dropped = 0;

    while dropped < need {
        match q.front() {
            Some(f) if f.silent => {
                q.pop_front();
                dropped += 1;
            }
            _ => break,
        }
    }
}

fn zero_frame() -> Vec<u8> {
    vec![0; FRAME_BYTES]
}