mod files;
mod stream;
use files::image_cache;
use stream::p2p_commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Iroh官方加密使用
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("failed to install rustls crypto provider");

    tauri::Builder::default()
        .manage(p2p_commands::AppState::new())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            p2p_commands::p2p_start,
            p2p_commands::p2p_stop,
            p2p_commands::p2p_test,
            p2p_commands::p2p_state,
            p2p_commands::p2p_get_ticket,
            p2p_commands::p2p_start_accept,
            p2p_commands::p2p_start_connect,
            p2p_commands::p2p_send,
            p2p_commands::send_to_this_window,
            image_cache::get_image_cached,
            image_cache::clear_image_cache,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
