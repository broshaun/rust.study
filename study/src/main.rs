use mylib::add;
use myiroh::client;
use myiroh::server;

#[tokio::main]
async fn main() {
    println!("Hello, world!");

    let num = add(1, 2);
    println!("add is {}", num);

    let (ep, addr) = server::get_server_addr().await.unwrap();
    println!("SERVER ADDR: {:#?}", addr);

    let server_task = tokio::spawn(async move {
        if let Err(e) = server::run_server(ep).await {
            eprintln!("server error: {}", e);
        }
    });

    client::run_client(addr).await.unwrap();

    if let Ok(ip) = server::get_public_ip().await {
        println!("pub ip is {}", ip);
    } else {
        println!("获取Public IP失败...");
    }

    let _ = server_task.await;
}