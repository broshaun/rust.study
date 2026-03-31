use libp2p::{multiaddr::Protocol, Multiaddr, PeerId};
use serde::Serialize;
use tauri::{AppHandle, State};
use tokio::time::{sleep, Duration};

use super::p2p_transport::{ListenAddrs, P2PState};

#[derive(Serialize)]
pub struct InitResponse {
    pub peer_id: String,
    pub preferred_addr: String,
    pub quic_addr: String,
    pub tcp_addr: String,
}

fn split_peer_addr(addr: Multiaddr) -> Result<(PeerId, Multiaddr), String> {
    let mut base = addr.clone();

    let last = base
        .pop()
        .ok_or_else(|| "multiaddr missing /p2p/<peer_id>".to_string())?;

    match last {
        Protocol::P2p(peer) => Ok((peer, base)),
        _ => Err("multiaddr must end with /p2p/<peer_id>".to_string()),
    }
}

fn full_addr(addr: &Option<Multiaddr>, peer_id: &str) -> String {
    addr.as_ref()
        .map(|a| format!("{}/p2p/{}", a, peer_id))
        .unwrap_or_default()
}

#[tauri::command]
pub async fn p2p_init(
    state: State<'_, P2PState>,
    app: AppHandle,
) -> Result<InitResponse, String> {
    state.inner().init(app).await?;

    let mut addrs = ListenAddrs::default();

    for _ in 0..30 {
        {
            let guard = state.inner().listen_addrs.lock().await;
            addrs = guard.clone();
            if addrs.quic.is_some() || addrs.tcp.is_some() {
                break;
            }
        }
        sleep(Duration::from_millis(100)).await;
    }

    let peer_id = state.inner().peer_id.to_string();
    let quic_addr = full_addr(&addrs.quic, &peer_id);
    let tcp_addr = full_addr(&addrs.tcp, &peer_id);
    let preferred_addr = if !quic_addr.is_empty() {
        quic_addr.clone()
    } else {
        tcp_addr.clone()
    };

    Ok(InitResponse {
        peer_id,
        preferred_addr,
        quic_addr,
        tcp_addr,
    })
}

#[tauri::command]
pub async fn p2p_connect(
    quic_addr: Option<String>,
    tcp_addr: Option<String>,
    state: State<'_, P2PState>,
) -> Result<(), String> {
    let mut peer: Option<PeerId> = None;
    let mut addrs: Vec<Multiaddr> = Vec::new();

    if let Some(addr) = quic_addr {
        let (p, base) = split_peer_addr(addr.parse::<Multiaddr>().map_err(|e| e.to_string())?)?;
        peer = Some(p);
        addrs.push(base);
    }

    if let Some(addr) = tcp_addr {
        let (p, base) = split_peer_addr(addr.parse::<Multiaddr>().map_err(|e| e.to_string())?)?;
        if let Some(existing) = peer {
            if existing != p {
                return Err("quic peer_id and tcp peer_id do not match".to_string());
            }
        } else {
            peer = Some(p);
        }
        addrs.push(base);
    }

    let peer = peer.ok_or_else(|| "no remote address provided".to_string())?;
    if addrs.is_empty() {
        return Err("no dialable address provided".to_string());
    }

    state.inner().dial(peer, addrs).await
}

#[tauri::command]
pub async fn p2p_send(
    peer_id: String,
    data: Vec<u8>,
    state: State<'_, P2PState>,
) -> Result<(), String> {
    let peer = peer_id.parse::<PeerId>().map_err(|e| e.to_string())?;
    state.inner().send(peer, data).await
}

#[tauri::command]
pub async fn p2p_ping(
    peer_id: String,
    state: State<'_, P2PState>,
) -> Result<String, String> {
    let peer = peer_id.parse::<PeerId>().map_err(|e| e.to_string())?;
    state.inner().ping_peer(peer).await
}

#[tauri::command]
pub async fn p2p_close(
    _: String,
    state: State<'_, P2PState>,
) -> Result<(), String> {
    state.inner().close().await
}