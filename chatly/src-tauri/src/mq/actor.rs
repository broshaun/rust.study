use actix::prelude::*;
use rumqttc::{AsyncClient, Event, Incoming, MqttOptions, QoS};
use serde::Serialize;
use std::time::Duration;
use tauri::ipc::Channel;

#[derive(Clone, Serialize)]
pub struct MqttMessage {
    pub topic: String,
    pub payload: String,
}

pub struct MqttActor {
    pub client_id: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub topic: String,
    pub on_message: Channel<MqttMessage>,
}

impl Actor for MqttActor {
    type Context = Context<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        let client_id = self.client_id.clone();
        let host = self.host.clone();
        let port = self.port;
        let username = self.username.clone();
        let password = self.password.clone();
        let topic = self.topic.clone();
        let on_message = self.on_message.clone();

        ctx.spawn(
            async move {
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
                    match eventloop.poll().await {
                        Ok(Event::Incoming(Incoming::Publish(packet))) => {
                            let payload =
                                String::from_utf8_lossy(&packet.payload).to_string();

                            send(&on_message, packet.topic, payload);
                        }

                        Ok(_) => {}

                        Err(err) => {
                            send(&on_message, "mqtt/error", format!("{err:?}"));
                            tokio::time::sleep(Duration::from_secs(3)).await;
                        }
                    }
                }
            }
            .into_actor(self),
        );
    }

    fn stopped(&mut self, _ctx: &mut Self::Context) {
        println!("[MQTT Actor stopped] {}", self.client_id);
    }
}

pub struct StopMqtt;

impl Message for StopMqtt {
    type Result = ();
}

impl Handler<StopMqtt> for MqttActor {
    type Result = ();

    fn handle(&mut self, _msg: StopMqtt, ctx: &mut Context<Self>) {
        ctx.stop();
    }
}

fn send(
    channel: &Channel<MqttMessage>,
    topic: impl Into<String>,
    payload: impl Into<String>,
) {
    let _ = channel.send(MqttMessage {
        topic: topic.into(),
        payload: payload.into(),
    });
}