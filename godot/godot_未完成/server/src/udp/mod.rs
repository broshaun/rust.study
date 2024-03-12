use std::{io,net::SocketAddr, sync::Arc};
use tokio::net::UdpSocket;
use crate::apple::conf;
use crate::apple::model;
use crate::apple::Result;

mod udp_socket;
use conf::{ipadd,buffer};
use udp_socket::UdpServer;

/**
 * UDP服务启动
 */

#[tokio::main]
pub async fn start() {
    println!("启动udptest");
    let udp = UdpServer::new(ipadd::Conf::udp()).await.unwrap();
    let udp1 = Arc::new(udp);
    let udp2 = udp1.clone();

    // 用于udp发送数据
    tokio::spawn(async move {
        let rx = buffer::SqMsg::get_receiver();
        while let Ok(msg) = rx.recv_async().await {
            match udp1.udp_sender(msg).await {
                Ok(len) => {
                    println!("发送数据:{:?} 字节.", len);
                }
                Err(err) => {
                    println!("发送错误(UDP):{:?}!!!", err);
                }
            }
        }
    });

    // 用于接收udp服务数据
    loop {
        match udp2.udp_accept().await{
            Ok(cs) => {
                println!("接收到数据类型:{:?}.", cs);
            }
            Err(err) => {
                println!("接收错误(UDP):{:?}!!!", err);
            }
        }
    }

}
