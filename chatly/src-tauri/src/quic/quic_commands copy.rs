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

    // 绑定前端下行 Channel
    {
        let mut ch = state.downlink_channel.write().await;
        *ch = Some(channel);
    }

    // 初始化 endpoint
    let endpoint = state.init_node(addr).await?;
    let state_cloned = state.inner().clone();

    let handle = tauri::async_runtime::spawn(async move {
        while let Some(incoming) = endpoint.accept().await {
            match incoming.await {
                Ok(conn) => {
                    state_cloned.set_connection(conn.clone()).await;
                    spawn_recv_loop(conn, state_cloned.clone()).await;
                }
                Err(err) => {
                    eprintln!("[quic] accept incoming failed: {}", err);
                }
            }
        }
    });

    {
        let mut inner = state.inner.write().await;
        inner.server_task = Some(handle);
    }

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

    let conn = state.connect(addr, &server_name).await?;
    spawn_recv_loop(conn, state.inner().clone()).await;

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

async fn spawn_recv_loop(conn: quinn::Connection, state: QuicState) {
    tauri::async_runtime::spawn(async move {
        loop {
            match conn.accept_uni().await {
                Ok(mut recv) => {
                    let state_for_stream = state.clone();

                    tauri::async_runtime::spawn(async move {
                        loop {
                            let mut len_buf = [0u8; 4];

                            if let Err(err) = recv.read_exact(&mut len_buf).await {
                                eprintln!("[quic] read frame length failed: {}", err);
                                break;
                            }

                            let len = u32::from_be_bytes(len_buf) as usize;
                            let mut data = vec![0u8; len];

                            if let Err(err) = recv.read_exact(&mut data).await {
                                eprintln!("[quic] read frame body failed: {}", err);
                                break;
                            }

                            if let Some(ch) = &*state_for_stream.downlink_channel.read().await {
                                let _ = ch.send(data);
                            }
                        }
                    });
                }
                Err(err) => {
                    eprintln!("[quic] recv loop stopped: {}", err);
                    break;
                }
            }
        }
    });
}