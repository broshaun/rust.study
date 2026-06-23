use actix::Addr;
use std::collections::HashMap;
use tokio::sync::Mutex;

use super::actor::MqttActor;

pub struct MqttState {
    pub actors: Mutex<HashMap<String, Addr<MqttActor>>>,
}

impl MqttState {
    pub fn new() -> Self {
        Self {
            actors: Mutex::new(HashMap::new()),
        }
    }
}