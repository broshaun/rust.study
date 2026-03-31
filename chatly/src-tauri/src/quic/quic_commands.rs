use crate::quic::quic_transport::QuicState;
use std::net::SocketAddr;
use tauri::{ipc::Channel, State};

#[tauri::command]
pub async fn quic_init(
    bind_addr: String,
    channel: Channel<Vec<u8>>,
    state: State<'_, QuicState>,
) -> Result<(), String> {
    let addr: SocketAddr = bind_addr
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;

    state.set_downlink_channel(channel).await;
    state.init_node(addr).await?;
    Ok(())
}

#[tauri::command]
pub async fn quic_connect(
    remote: String,
    server_name: String,
    state: State<'_, QuicState>,
) -> Result<(), String> {
    let addr: SocketAddr = remote
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;

    state.connect(addr, &server_name).await?;
    Ok(())
}

#[tauri::command]
pub async fn quic_send(
    data: Vec<u8>,
    state: State<'_, QuicState>,
) -> Result<(), String> {
    state.send_bytes(data).await
}

#[tauri::command]
pub async fn quic_close(
    state: State<'_, QuicState>,
) -> Result<(), String> {
    state.close().await;
    Ok(())
}