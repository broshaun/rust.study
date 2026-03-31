use tauri::State;
use libp2p::Multiaddr;

use super::p2p_transport::P2PState;

#[tauri::command]
pub async fn p2p_init(state: State<'_, P2PState>) -> Result<String, String> {
    Ok(state.peer_id.to_string())
}

#[tauri::command]
pub async fn p2p_connect(
    addr: String,
    state: State<'_, P2PState>,
) -> Result<(), String> {
    let addr: Multiaddr = addr.parse().map_err(|e| e.to_string())?;

    let mut swarm = state.swarm.lock().await;
    swarm.dial(addr).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn p2p_send(
    peer_id: String,
    data: Vec<u8>,
    state: State<'_, P2PState>,
) -> Result<(), String> {
    let mut streams = state.streams.lock().await;

    if let Some(stream) = streams.get_mut(&peer_id) {
        use futures::AsyncWriteExt;
        stream.write_all(&data).await.map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("stream not found".into())
    }
}

#[tauri::command]
pub async fn p2p_close(
    peer_id: String,
    state: State<'_, P2PState>,
) -> Result<(), String> {
    let mut streams = state.streams.lock().await;
    streams.remove(&peer_id);
    Ok(())
}