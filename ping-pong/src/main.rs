use anyhow::Result;
use iroh::{Endpoint, Watcher, endpoint::presets, protocol::Router};
use iroh_ping::{ALPN, Ping};
use iroh_tickets::{Ticket, endpoint::EndpointTicket};

#[tokio::main]
async fn main() -> Result<()> {

    println!("iroh开发测试\n");
    println!("启动节点\n");
    let endpoint = Endpoint::bind(presets::N0).await?;
    endpoint.online().await; // 启动节点
    let ticket = EndpointTicket::new(endpoint.addr());
    println!("{} \n", ticket);
    println!("节点信息: \n {:#?}", ticket);


    println!("++++++++++++++++++++++监听Ping服务++++++++++++++++++++++");
    let ping = Ping::new();
    let recv_router = Router::builder(endpoint).accept(ALPN, ping).spawn(); //处理ping请求，并返回路由
    let addr = recv_router.endpoint().addr();
    println!("++++++++++++++++++++++监听Ping服务++++++++++++++++++++++");

    println!("++++++++++++++++++++++连接信息++++++++++++++++++++++");
    let send_ep = Endpoint::bind(presets::N0).await?;
    let conn = send_ep.connect(addr.clone(), ALPN).await?;
    println!("远程Id: {}", conn.remote_id());
    let mut watcher = conn.paths();
    let paths = watcher.get();
    println!("路径信息:\n{:#?}", paths);
    println!("++++++++++++++++++++++连接信息++++++++++++++++++++++");

    

    println!("\n发送Ping请求");
    let send_pinger = Ping::new();
    let rtt = send_pinger.ping(&send_ep, addr).await?;
    println!("Ping值: {:?} \n", rtt);

    Ok(())
}
