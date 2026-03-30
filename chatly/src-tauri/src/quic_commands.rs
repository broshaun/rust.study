use crate::audio_transport::{broadcast_audio_packet, AudioTransportState};
use crate::quic_transport::QuicTransportState;
use std::net::SocketAddr;
use tauri::State;

async fn spawn_datagram_recv_loop(
    connection: quinn::Connection,
    audio_state: AudioTransportState,
    quic_state: QuicTransportState,
) {
    tauri::async_runtime::spawn(async move {
        loop {
            match connection.read_datagram().await {
                Ok(bytes) => {
                    println!("[recv_loop] got datagram: {} bytes", bytes.len());

                    // 收到远端语音后，推给本机前端播放
                    broadcast_audio_packet(audio_state.clone(), bytes.to_vec()).await;

                    // 保存连接，这样本机也可以通过这个连接把自己的语音发回去
                    quic_state.set_connection(connection.clone()).await;
                }
                Err(err) => {
                    eprintln!("[recv_loop] stopped: {}", err);
                    break;
                }
            }
        }
    });
}

#[tauri::command]
pub async fn quic_init_node(
    bind_addr: String,
    quic_state: State<'_, QuicTransportState>,
    audio_state: State<'_, AudioTransportState>,
) -> Result<(), String> {
    println!("[quic_init_node] bind_addr = {}", bind_addr);

    let bind_addr: SocketAddr = bind_addr
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;

    let endpoint = quic_state.init_node(bind_addr).await?;

    let quic_state_cloned = quic_state.inner().clone();
    let audio_state_cloned = audio_state.inner().clone();

    let handle = tauri::async_runtime::spawn(async move {
        println!("[node] accept loop started");

        while let Some(incoming) = endpoint.accept().await {
            println!("[node] incoming connection...");
            match incoming.await {
                Ok(connection) => {
                    println!("[node] accepted connection");
                    quic_state_cloned.set_connection(connection.clone()).await;

                    spawn_datagram_recv_loop(
                        connection,
                        audio_state_cloned.clone(),
                        quic_state_cloned.clone(),
                    )
                    .await;
                }
                Err(error) => {
                    eprintln!("[node] accept failed: {}", error);
                }
            }
        }

        println!("[node] accept loop ended");
    });

    quic_state.set_server_task(handle).await;

    Ok(())
}

#[tauri::command]
pub async fn quic_connect(
    remote_addr: String,
    server_name: String,
    quic_state: State<'_, QuicTransportState>,
    audio_state: State<'_, AudioTransportState>,
) -> Result<(), String> {
    println!(
        "[quic_connect] remote_addr = {}, server_name = {}",
        remote_addr, server_name
    );

    let has_endpoint = quic_state.has_endpoint().await;
    println!("[quic_connect] endpoint exists before connect = {}", has_endpoint);

    let remote_addr: SocketAddr = remote_addr
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;

    let connection = quic_state.connect(remote_addr, &server_name).await?;
    println!("[quic_connect] connected");

    spawn_datagram_recv_loop(
        connection,
        audio_state.inner().clone(),
        quic_state.inner().clone(),
    )
    .await;

    Ok(())
}

#[tauri::command]
pub async fn quic_close(
    quic_state: State<'_, QuicTransportState>,
) -> Result<(), String> {
    println!("[quic_close] requested");
    quic_state.close().await;
    Ok(())
}