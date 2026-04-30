mod quic;
mod p2p;
mod stream;

use std::sync::Arc;

use quic::quic_commands::{quic_close, quic_connect, quic_init, quic_send};
use quic::quic_transport::QuicState;

// use p2p::p2p_commands::{
//     p2p_close,
//     p2p_connect,
//     p2p_get_local_addr,
//     p2p_init,
//     p2p_send,
//     p2p_voice_close,
//     p2p_voice_push_raw_packet,
//     p2p_voice_send_pcm,
//     p2p_voice_set_downlink,
// };
use p2p::p2p_state_voice::P2PStateVoice;
use p2p::p2p_transport::P2PState;


use stream::p2p_commands;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = rustls::crypto::ring::default_provider().install_default();

    let voice_state: Arc<P2PStateVoice> =
        P2PStateVoice::new().expect("failed to initialize P2PStateVoice");

    voice_state.start_playout_loop();

    tauri::Builder::default()
        .manage(QuicState::default())
        .manage(P2PState::default())
        .manage(voice_state)
        .manage(p2p_commands::AppState::new())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            quic_init,
            quic_connect,
            quic_send,
            quic_close,

            // p2p_init,
            // p2p_connect,
            // p2p_send,
            // p2p_get_local_addr,
            // p2p_close,
            
            // p2p_voice_set_downlink,
            // p2p_voice_send_pcm,
            // p2p_voice_push_raw_packet,
            // p2p_voice_close,


            p2p_commands::p2p_start,
            p2p_commands::p2p_stop,
            p2p_commands::p2p_test,
            // p2p_commands::p2p_state,
            // p2p_commands::p2p_state_message,

            p2p_commands::p2p_info,
            p2p_commands::p2p_get_ticket,

            p2p_commands::p2p_start_accept,
            p2p_commands::p2p_start_connect,
            p2p_commands::p2p_send,
            p2p_commands::p2p_recv,
            

            p2p_commands::send_to_this_window,
            

        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}