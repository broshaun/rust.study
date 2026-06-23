use actix::Actor;
use tauri::{ipc::Channel, State};

use super::{
    actor::{MqttActor, MqttMessage, StopMqtt},
    state::MqttState,
};

#[tauri::command]
pub async fn mqtt_subscribe(
    client_id: String,
    host: String,
    port: u16,
    username: String,
    password: String,
    topic: String,
    on_message: Channel<MqttMessage>,
    state: State<'_, MqttState>,
) -> Result<(), String> {
    let mut actors = state.actors.lock().await;

    if let Some(addr) = actors.get(&client_id) {
        if addr.connected() {
            return Err(format!("mqtt already running: {client_id}"));
        }
    }

    let addr = MqttActor {
        client_id: client_id.clone(),
        host,
        port,
        username,
        password,
        topic,
        on_message,
    }
    .start();

    actors.insert(client_id, addr);

    Ok(())
}

#[tauri::command]
pub async fn mqtt_unsubscribe(
    client_id: String,
    state: State<'_, MqttState>,
) -> Result<(), String> {
    let mut actors = state.actors.lock().await;

    if let Some(addr) = actors.remove(&client_id) {
        addr.do_send(StopMqtt);
    }

    Ok(())
}

#[tauri::command]
pub async fn mqtt_status(
    client_id: String,
    state: State<'_, MqttState>,
) -> Result<bool, String> {
    let actors = state.actors.lock().await;

    Ok(actors
        .get(&client_id)
        .map(|addr| addr.connected())
        .unwrap_or(false))
}