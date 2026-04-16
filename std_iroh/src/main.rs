mod ping;
mod stream;

#[tokio::main]
async fn main() {
    println!("iroh开发测试\n");

    let server = stream::stream::Node::new().await.unwrap();
    let client = stream::stream::Node::new().await.unwrap();

    let ticket = server.get_ticket();
    server.print_info();
    println!("is_online {}", server.is_online());

    let accept_task = tokio::spawn(async move {
        if let Err(e) = server.start_accept().await {
            eprintln!("服务端 accept 失败: {:#?}", e);
            return;
        }

        if let Err(e) = server.send(b"ping".to_vec()).await {
            eprintln!("服务端发送失败: {:#?}", e);
            return;
        }

        loop {
            match server.recv().await {
                Ok(Some(data)) => {
                    println!("服务端收到 bytes: {:?}", data);
                    println!("服务端收到 text: {}", String::from_utf8_lossy(&data));
                }
                Ok(None) => {
                    println!("服务端连接已断开");
                    break;
                }
                Err(e) => {
                    eprintln!("服务端接收失败: {:#?}", e);
                    break;
                }
            }
        }
        // 会话关闭
        server.close_session().await;
        println!("服务端会话已关闭");

        // 节点关闭
        server.close().await;
        println!("服务端节点已关闭");
    });

    if let Err(e) = client.start_connect(ticket).await {
        eprintln!("客户端连接失败: {:#?}", e);
        return;
    }

    if let Err(e) = client.send(b"123".to_vec()).await {
        eprintln!("客户端发送失败: {:#?}", e);
        return;
    }

    let _ = accept_task.await;
}