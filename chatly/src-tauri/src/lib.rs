mod files;
mod p2p;
use files::image_cache;
use p2p::p2p_commands;
mod actor;
mod mq;
mod net;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Iroh官方加密使用
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("failed to install rustls crypto provider");

    tauri::Builder::default()
        .plugin(tauri_plugin_edge_to_edge::init())
        .manage(p2p_commands::AppState::new())
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
            net::http::http_get,
            net::http::http_post,
            net::http::http_upload,
            mq::mqtt::subscribe,
            mq::mqtt::unsubscribe,
            actor::test::test,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
