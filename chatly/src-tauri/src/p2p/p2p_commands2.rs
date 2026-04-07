use std::sync::Arc;

use serde::Serialize;
use tauri::{ipc::Channel, AppHandle, State};

use super::p2p_state_voice::P2PStateVoice;
use super::p2p_transport::P2PState;

#[derive(Debug, Serialize)]
pub struct InitResponse {
    pub local_addr_json: String,
}

/// --------------------
/// 原始 p2p 传输接口
/// --------------------

#[tauri::command]
pub async fn p2p_init(
    state: State<'_, P2PState>,
    app: AppHandle,
    channel: Channel<Vec<u8>>,
) -> Result<InitResponse, String> {
    state.set_raw_downlink_channel(channel).await;
    state.init(app).await?;

    let local_addr_json = state.get_local_addr_json().await?;
    Ok(InitResponse { local_addr_json })
}

#[tauri::command]
pub async fn p2p_connect(
    remote_addr_json: String,
    state: State<'_, P2PState>,
) -> Result<(), String> {
    let remote_addr_json = remote_addr_json.trim();
    if remote_addr_json.is_empty() {
        return Err("remote_addr_json is empty".to_string());
    }

    state.dial(remote_addr_json.to_string()).await
}

#[tauri::command]
pub async fn p2p_send(
    data: Vec<u8>,
    state: State<'_, P2PState>,
) -> Result<(), String> {
    if data.is_empty() {
        return Ok(());
    }

    state.send(data).await
}

#[tauri::command]
pub async fn p2p_get_local_addr(
    state: State<'_, P2PState>,
) -> Result<String, String> {
    state.get_local_addr_json().await
}

#[tauri::command]
pub async fn p2p_close(
    state: State<'_, P2PState>,
) -> Result<(), String> {
    state.close().await
}

/// --------------------
/// p2p voice layer（PCM 直通版）
/// --------------------

#[tauri::command]
pub async fn p2p_voice_set_downlink(
    channel: Channel<Vec<u8>>,
    voice: State<'_, Arc<P2PStateVoice>>,
) -> Result<(), String> {
    voice.set_voice_downlink_channel(channel).await;
    Ok(())
}

#[tauri::command]
pub async fn p2p_voice_send_pcm(
    data: Vec<u8>,
    p2p: State<'_, P2PState>,
    voice: State<'_, Arc<P2PStateVoice>>,
) -> Result<(), String> {
    if data.is_empty() {
        return Ok(());
    }

    let frame = voice.prepare_pcm_frame(data).await?;
    p2p.send(frame).await
}

#[tauri::command]
pub async fn p2p_voice_push_raw_packet(
    data: Vec<u8>,
    voice: State<'_, Arc<P2PStateVoice>>,
) -> Result<(), String> {
    if data.is_empty() {
        return Ok(());
    }

    voice.consume_pcm_frame(data).await
}

#[tauri::command]
pub async fn p2p_voice_close(
    voice: State<'_, Arc<P2PStateVoice>>,
) -> Result<(), String> {
    voice.close().await
}