mod audio_transport;
mod quic_transport;
mod quic_commands;

use audio_transport::{
    close_audio_transport,
    open_audio_transport,
    push_audio_uplink,
    AudioTransportState,
};

use quic_transport::QuicTransportState;

use quic_commands::{
    quic_init_node,
    quic_connect,
    quic_close,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = rustls::crypto::ring::default_provider().install_default();

    tauri::Builder::default()
        .manage(AudioTransportState::default())
        .manage(QuicTransportState::default())
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
            open_audio_transport,
            push_audio_uplink,
            close_audio_transport,
            quic_init_node,
            quic_connect,
            quic_close
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}