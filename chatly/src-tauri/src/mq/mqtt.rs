use rumqttc::{AsyncClient, Event, Incoming, MqttOptions, QoS};
use serde::Serialize;
use std::{sync::OnceLock, time::Duration};
use tauri::ipc::Channel;
use tokio_util::{sync::CancellationToken, task::TaskTracker};
use xtra::prelude::*;




#[derive(xtra::Actor)]
struct MqttActor {
    tracker: TaskTracker,
    token: Option<CancellationToken>,
}

static MQTT_ACTOR: OnceLock<Address<MqttActor>> = OnceLock::new();

impl MqttActor {
    fn start() -> Address<Self> {
        let (addr, mailbox) = Mailbox::bounded(32);
        xtra::spawn_tokio(
            Self {
                tracker: TaskTracker::new(),
                token: None,
            },
            (addr.clone(), mailbox),
        );
        addr
    }
    async fn stop(&mut self) {
        if let Some(token) = self.token.take() {
            token.cancel();
        }
        self.tracker.close();
        self.tracker.wait().await;
        self.tracker = TaskTracker::new();
    }
    fn new_token(&mut self) -> CancellationToken {
        let token = CancellationToken::new();
        self.token = Some(token.clone());
        token
    }
}

#[derive(Clone, Serialize)]
pub struct MqttMessage {
    pub topic: String,
    pub payload: String,
}
struct SubscribeCmd {
    client_id: String,
    host: String,
    port: u16,
    username: String,
    password: String,
    topics: Vec<String>,
    on_message: Channel<MqttMessage>,
}
impl Handler<SubscribeCmd> for MqttActor {
    type Return = Result<(), String>;
    async fn handle(&mut self, cmd: SubscribeCmd, _ctx: &mut Context<Self>) -> Self::Return {
        self.stop().await;
        let mut options = MqttOptions::new(cmd.client_id, cmd.host, cmd.port);
        if !cmd.username.is_empty() {
            options.set_credentials(cmd.username, cmd.password);
        }
        options.set_keep_alive(Duration::from_secs(30));
        let (client, mut eventloop) = AsyncClient::new(options, 10);
        for topic in &cmd.topics {
            client
                .subscribe(topic, QoS::AtLeastOnce)
                .await
                .map_err(|e| e.to_string())?;
        }
        let token = self.new_token();
        let on_message = cmd.on_message;
        self.tracker.spawn(async move {
            loop {
                tokio::select! {
                    _ = token.cancelled() => {
                        break;
                    }
                    event = eventloop.poll() => {
                        match event {
                            Ok(Event::Incoming(Incoming::Publish(p))) => {
                                let message = MqttMessage {
                                    topic: p.topic,
                                    payload: String::from_utf8_lossy(&p.payload).to_string(),
                                };
                                if on_message.send(message).is_err() {
                                    break;
                                }
                            }
                            Ok(_) => {}
                            Err(e) => {
                                eprintln!("MQTT eventloop stopped: {e}");
                                break;
                            }
                        }
                    }
                }
            }
        });
        Ok(())
    }
}

struct StopCmd;
impl Handler<StopCmd> for MqttActor {
    type Return = Result<(), String>;
    async fn handle(&mut self, _cmd: StopCmd, _ctx: &mut Context<Self>) -> Self::Return {
        self.stop().await;
        Ok(())
    }
}

#[tauri::command]
pub async fn subscribe(
    client_id: String,
    host: String,
    port: u16,
    username: String,
    password: String,
    topics: Vec<String>,
    on_message: Channel<MqttMessage>,
) -> Result<(), String> {
    MQTT_ACTOR
        .get_or_init(MqttActor::start)
        .send(SubscribeCmd {
            client_id,
            host,
            port,
            username,
            password,
            topics,
            on_message,
        })
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn unsubscribe() -> Result<(), String> {
    MQTT_ACTOR
        .get_or_init(MqttActor::start)
        .send(StopCmd)
        .await
        .map_err(|e| e.to_string())?
}
