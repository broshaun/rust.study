use crate::quic_transport::QuicTransportState;
use serde::Serialize;
use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
};
use tauri::{ipc::Channel, State};
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct AudioTransportState {
    pub next_session_id: Arc<AtomicU64>,
    pub sessions: Arc<RwLock<HashMap<u64, Channel<AudioDownlinkMessage>>>>,
}

impl Default for AudioTransportState {
    fn default() -> Self {
        Self {
            next_session_id: Arc::new(AtomicU64::new(1)),
            sessions: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "type", content = "data")]
pub enum AudioDownlinkMessage {
    Ready { session_id: u64 },
    AudioChunk { session_id: u64, payload: Vec<u8> },
    Closed { session_id: u64 },
    Error { session_id: Option<u64>, message: String },
}

pub async fn broadcast_audio_packet(
    state: AudioTransportState,
    payload: Vec<u8>,
) {
    let sessions = state.sessions.read().await;

    for (session_id, downlink) in sessions.iter() {
        let _ = downlink.send(AudioDownlinkMessage::AudioChunk {
            session_id: *session_id,
            payload: payload.clone(),
        });
    }
}

#[tauri::command]
pub async fn open_audio_transport(
    downlink: Channel<AudioDownlinkMessage>,
    state: State<'_, AudioTransportState>,
) -> Result<u64, String> {
    let session_id = state.next_session_id.fetch_add(1, Ordering::SeqCst);

    {
        let mut sessions = state.sessions.write().await;
        sessions.insert(session_id, downlink.clone());
    }

    downlink
        .send(AudioDownlinkMessage::Ready { session_id })
        .map_err(|e| e.to_string())?;

    Ok(session_id)
}

#[tauri::command]
pub async fn push_audio_uplink(
    session_id: u64,
    payload: Vec<u8>,
    state: State<'_, AudioTransportState>,
    quic_state: State<'_, QuicTransportState>,
) -> Result<(), String> {
    let exists = {
        let sessions = state.sessions.read().await;
        sessions.contains_key(&session_id)
    };

    if !exists {
        return Err(format!("session {} not found", session_id));
    }

    quic_state.send_datagram(payload).await
}

#[tauri::command]
pub async fn close_audio_transport(
    session_id: u64,
    state: State<'_, AudioTransportState>,
) -> Result<(), String> {
    let removed = {
        let mut sessions = state.sessions.write().await;
        sessions.remove(&session_id)
    };

    if let Some(channel) = removed {
        let _ = channel.send(AudioDownlinkMessage::Closed { session_id });
    }

    Ok(())
}