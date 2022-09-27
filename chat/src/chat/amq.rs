use crate::{chat::jwt, utils::answer::Rsp};
use actix_web::{get, put, web, HttpRequest, Responder};
use amiquip::{
    Channel, Connection, ConsumerMessage, ConsumerOptions, ExchangeDeclareOptions, ExchangeType,
    FieldTable, Publish, QueueDeclareOptions, QueueDeleteOptions,
};
use bincode;
use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use std::error::Error;
use crate::config::Conf;

struct Amqp {
    conn: Connection,
}

impl Amqp {
    fn open_conn() -> Result<Self, Box<dyn Error>> {
        let constr  = Conf::base().amqp();
        let conn = Connection::insecure_open(&constr).unwrap();
        return Ok(Self { conn });
    }

    fn new_chan(&mut self, chanid: Option<u16>) -> Result<Channel, Box<dyn Error>> {
        let chann = self.conn.open_channel(chanid)?;
        Ok(chann)
    }
    fn close(self) {
        self.conn.close().unwrap();
    }
}

#[derive(Debug, Deserialize, Serialize)]
struct News {
    to: String,
    msg: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct Msg {
    from: String,
    msg: String,
    time: u64,
}

impl Msg {
    fn default() -> Self {
        Self {
            from: "Unk".to_owned(),
            msg: "...".to_owned(),
            time: Local::now().timestamp() as u64,
        }
    }
}

#[put("/send/")]
async fn send(req: HttpRequest, news: web::Json<News>) -> impl Responder {
    let mut msg = Msg::default();
    let mut amqp = Amqp::open_conn().unwrap();

    msg.from = match jwt::parse::<String>(req) {
        Ok(s) => s.uid,
        Err(e) => {
            return e.to_json();
        }
    };
    msg.msg = news.msg.clone();
    let tomsg = bincode::serialize(&msg).unwrap();

    let chan = amqp.new_chan(None).unwrap();

    let mut op1 = ExchangeDeclareOptions::default();
    op1.durable = true;
    let exchange = chan
        .exchange_declare(ExchangeType::Direct, "chat", op1)
        .unwrap();
    let mut op2 = QueueDeclareOptions::default();
    op2.durable = true;
    let q1 = chan.queue_declare(&news.to, op2).unwrap();
    q1.bind(&exchange, news.to.to_string(), FieldTable::default())
        .unwrap();

    exchange
        .publish(Publish::new(&tomsg, news.to.to_string()))
        .unwrap();

    let msg2: Msg = bincode::deserialize(&tomsg).unwrap();
    amqp.close();
    return Rsp::<Msg>::Ok{msg:None, data: Some(msg2) }.to_json();
}

#[get("/receive/")]
async fn receive(req: HttpRequest) -> impl Responder {
    let uid = match jwt::parse::<String>(req) {
        Ok(s) => s.uid,
        Err(e) => {
            return e.to_json();
        }
    };
    let mut amqp = Amqp::open_conn().unwrap();
    let channel = amqp.new_chan(None).unwrap();
    let mut op1 = QueueDeclareOptions::default();
    op1.durable = true;
    let queue = channel.queue_declare(uid, op1).unwrap();
    match &queue.declared_message_count() {
        Some(msg_count) => {
            if let 0 = msg_count {
                queue.delete(QueueDeleteOptions::default()).unwrap();
                return Rsp::<String>::NoContent{msg:None}.to_json();
            }
        }
        _ => {}
    }
    let consumer = queue.consume(ConsumerOptions::default()).unwrap();
    let a = consumer.receiver();
    let b = a.recv().unwrap();
    let msg = match b {
        ConsumerMessage::Delivery(delivery) => {
            let body = &delivery.body;
            let msg: Msg = bincode::deserialize(body).unwrap();
            consumer.ack(delivery).unwrap();
            msg
        }
        _ => Msg::default(),
    };
    amqp.close();
    return Rsp::<Msg>::Ok {msg:None, data: Some(msg) }.to_json();
}
