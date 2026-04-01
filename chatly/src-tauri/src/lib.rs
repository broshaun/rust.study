mod quic;
mod p2p;

use quic::quic_commands::{quic_close, quic_connect, quic_init, quic_send};
use quic::quic_transport::QuicState;

use p2p::p2p_commands::{
    p2p_close,
    p2p_connect,
    p2p_get_local_addr,
    p2p_init,
    p2p_send,
};
use p2p::p2p_transport::P2PState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = rustls::crypto::ring::default_provider().install_default();

    tauri::Builder::default()
        .manage(QuicState::default())
        .manage(P2PState::default())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            quic_init,
            quic_connect,
            quic_send,
            quic_close,
            p2p_init,
            p2p_connect,
            p2p_send,
            p2p_get_local_addr,
            p2p_close,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}