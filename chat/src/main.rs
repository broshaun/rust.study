use actix_web::{web, App, Responder, HttpServer};
mod chat;
mod config;
use config::Conf;
use chat::amq;
use chat::jwt;
use tokio::net::UdpSocket;
use std::thread;
mod utils;
use utils::answer::Rsp;



fn main() {
    thread::spawn(|| {
        println!("启动udptest");
        udp().unwrap();
    });
    println!("启动tcptest");
    chat().unwrap();
}

#[tokio::main]
async fn udp() -> std::io::Result<()> {
    let addr = Conf::base().udp();
    let sock = UdpSocket::bind(addr).await?;
    let mut buf = [0; 1024];
    loop {
        let (len, fromaddr) = sock.recv_from(&mut buf).await?;
        println!("{:?} 字节接受于主机 {:?}", len, fromaddr);

        let len = sock.send_to(fromaddr.to_string().as_bytes(), fromaddr).await?;
        println!("接收字节长度:{:?}", len);
        // let s = match str::from_utf8(&buf) {
        //     Ok(v) => v,
        //     Err(e) => panic!("Invalid UTF-8 sequence: {}", e),
        // };
        // println!("接收的字符{:?}",s);
    }
}

#[actix_web::main]
async fn chat() -> std::io::Result<()> {
    println!("启动聊天服务器...");
    let addr = Conf::base().tcp();
    HttpServer::new(|| {
        App::new()
            .service(chat::hello)
            .service(web::scope("/chat")
                .service(amq::send)
                .service(amq::receive)
            )
            .service(jwt::new_session)
            .service(jwt::token_verify)
            .default_service(web::route().to(not_found))
    })
    .bind(addr)?
    .run()
    .await
}


async fn not_found() -> impl Responder {
    Rsp::<String>::NotFound{msg:None}.to_json()
}