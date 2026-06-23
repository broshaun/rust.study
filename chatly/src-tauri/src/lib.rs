mod files;
mod p2p;
use files::image_cache;
use p2p::p2p_commands;
mod net;
mod mq;
mod tasks;
mod actor;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    // let system = actix::System::new();
    // system.run();

    // Iroh官方加密使用
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("failed to install rustls crypto provider");

    tauri::Builder::default()
        .manage(p2p_commands::AppState::new())
        .manage(tasks::TaskManager::new())
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


            tasks::commands::spawn_demo_task,
            tasks::commands::list_tasks,
            tasks::commands::cancel_task,
            tasks::commands::cancel_all_tasks,
            tasks::commands::shutdown,

            actor::test::test,
            
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
