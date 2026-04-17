mod ping;
mod stream;

use anyhow::Result;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() -> Result<()> {
    println!("=== Iroh 双工流开发测试 ===\n");

    let mut server = stream::stream::Node::new().await?;
    let mut client = stream::stream::Node::new().await?;

    let ticket = server.get_ticket();
    server.print_info();
    println!("Server is_online: {}", server.is_online());

    let accept_task = tokio::spawn(async move {
        if let Err(e) = server.start_accept().await {
            eprintln!("🔴 [Server] accept 失败: {:#?}", e);
            return;
        }
        println!("🟢 [Server] 已接受客户端连接！");

        if let Err(e) = server.send(b"ping from server".to_vec()).await {
            eprintln!("🔴 [Server] 发送失败: {:#?}", e);
            return;
        }

        loop {
            match server.recv().await {
                Ok(data) => {
                    println!("📬 [Server] 收到 bytes: {:?}", data);
                    println!("📬 [Server] 收到 text:  {}", String::from_utf8_lossy(&data));
                }
                Err(e) => {
                    eprintln!("🔴 [Server] 接收失败: {:#?}", e);
                    break;
                }
            }
        }

        server.close().await;
        println!("🛑 [Server] 节点已完全关闭");
    });

    sleep(Duration::from_millis(100)).await;

    println!("🔵 [Client] 正在连接服务端...");
    client.start_connect(&ticket).await?;
    println!("🟢 [Client] 连接成功！");

    println!("🔵 [Client] 发送消息 '123'...");
    client.send(b"123".to_vec()).await?;

    match client.recv().await {
        Ok(data) => {
            println!("📬 [Client] 收到 text: {}", String::from_utf8_lossy(&data));
        }
        Err(e) => {
            println!("⚠️ [Client] 没收到服务端消息{:#?}",e);
        }
    }

    sleep(Duration::from_millis(500)).await;

    println!("🔵 [Client] 主动断开连接并退出...");
    client.close().await;

    let _ = accept_task.await;
    println!("\n✅ 测试圆满结束");

    Ok(())
}