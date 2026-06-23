use crate::tasks::TaskManager;
use rumqttc::{AsyncClient, Event, Incoming, MqttOptions, QoS};
use serde::Serialize;
use std::time::Duration;
use tauri::{ipc::Channel, State};

#[derive(Clone, Serialize)]
pub struct MqttMessage {
    pub topic: String,
    pub payload: String,
}

fn task_name(client_id: &str) -> String {
    format!("mqtt:sub:{client_id}")
}

fn send(ch: &Channel<MqttMessage>, topic: impl Into<String>, payload: impl Into<String>) {
    let _ = ch.send(MqttMessage {
        topic: topic.into(),
        payload: payload.into(),
    });
}

#[tauri::command]
pub async fn mqtt_subscribe(
    client_id: String,
    host: String,
    port: u16,
    username: String,
    password: String,
    topic: String,
    on_message: Channel<MqttMessage>,
    tasks: State<'_, TaskManager>,
) -> Result<(), String> {
    tasks.spawn(task_name(&client_id), move |token| async move {
        let mut options = MqttOptions::new(client_id, host, port);
        options.set_keep_alive(Duration::from_secs(30));
        options.set_credentials(username, password);

        let (client, mut eventloop) = AsyncClient::new(options, 10);

        if let Err(err) = client.subscribe(topic.clone(), QoS::AtLeastOnce).await {
            send(&on_message, "mqtt/error", format!("subscribe error: {err:?}"));
            return;
        }

        send(&on_message, "mqtt/status", "subscribed");

        loop {
            tokio::select! {
                _ = token.cancelled() => {
                    let _ = client.unsubscribe(topic.clone()).await;
                    send(&on_message, "mqtt/status", "cancelled");
                    break;
                }

                result = eventloop.poll() => match result {
                    Ok(Event::Incoming(Incoming::Publish(packet))) => {
                        send(
                            &on_message,
                            packet.topic,
                            String::from_utf8_lossy(&packet.payload).to_string(),
                        );
                    }

                    Ok(_) => {}

                    Err(err) => {
                        send(&on_message, "mqtt/error", format!("{err:?}"));
                        tokio::time::sleep(Duration::from_secs(3)).await;
                    }
                }
            }
        }
    })
}

#[tauri::command]
pub fn mqtt_unsubscribe(
    client_id: String,
    tasks: State<'_, TaskManager>,
) -> Result<(), String> {
    tasks.cancel(&task_name(&client_id))
}