mod audio_transport;

use audio_transport::{
    close_audio_transport,
    open_audio_transport,
    push_audio_uplink,
    AudioTransportState,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AudioTransportState::default())
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
            close_audio_transport
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}