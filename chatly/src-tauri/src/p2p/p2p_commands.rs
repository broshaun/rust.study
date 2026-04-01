use serde::Serialize;
use tauri::{AppHandle, State, ipc::Channel};

use super::p2p_transport::P2PState;

#[derive(Serialize)]
pub struct InitResponse {
    pub local_addr_json: String,
}

#[tauri::command]
pub async fn p2p_init(
    state: State<'_, P2PState>,
    app: AppHandle,
    channel: Channel<Vec<u8>>,
) -> Result<InitResponse, String> {
    state.set_downlink_channel(channel).await;
    state.init(app).await?;

    let local_addr_json = state.get_local_addr_json().await?;

    Ok(InitResponse { local_addr_json })
}

#[tauri::command]
pub async fn p2p_connect(
    remote_addr_json: String,
    state: State<'_, P2PState>,
) -> Result<(), String> {
    if remote_addr_json.trim().is_empty() {
        return Err("remote_addr_json is empty".to_string());
    }

    state.dial(remote_addr_json).await
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
pub async fn p2p_close(state: State<'_, P2PState>) -> Result<(), String> {
    state.close().await
}