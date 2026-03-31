mod quic;

use quic::quic_commands::{quic_close, quic_connect, quic_init, quic_send};
use quic::quic_transport::QuicState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // QUIC / rustls 所需
    let _ = rustls::crypto::ring::default_provider().install_default();

    tauri::Builder::default()
        // 注入统一的 QUIC 状态
        .manage(QuicState::default())
        // 插件
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        // 日志
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
        // 纯 bytes 转发命令
        .invoke_handler(tauri::generate_handler![
            quic_init,
            quic_connect,
            quic_send,
            quic_close,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}