#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri_plugin_http::init as init_http_plugin;
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}