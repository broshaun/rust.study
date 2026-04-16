mod ping;
mod stream;

use anyhow::Result;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() -> Result<()> {
    println!("=== Iroh 双工流开发测试 ===\n");

    let server = stream::stream::Node::new().await?;
    let client = stream::stream::Node::new().await?;

    let ticket = server.get_ticket();
    server.print_info();
    println!("Server is_online: {}", server.is_online());

    // ==========================================
    // 任务 A：服务端后台运行
    // ==========================================
    // 注意：因为我们优化了 Node，它内部是 Arc，你可以随意 clone 它丢进任务！
    // 但这里 server 外部不再用了，直接 move 进去也没问题。
    let accept_task = tokio::spawn(async move {
        if let Err(e) = server.start_accept().await {
            eprintln!("🔴 [Server] accept 失败: {:#?}", e);
            return;
        }
        println!("🟢 [Server] 已接受客户端连接！");

        // 给客户端发个问候
        if let Err(e) = server.send(b"ping from server".to_vec()).await {
            eprintln!("🔴 [Server] 发送失败: {:#?}", e);
            return;
        }

        // 持续接收消息
        loop {
            match server.recv().await {
                Ok(Some(data)) => {
                    println!("📬 [Server] 收到 bytes: {:?}", data);
                    println!("📬 [Server] 收到 text:  {}", String::from_utf8_lossy(&data));
                }
                Ok(None) => {
                    println!("⚠️ [Server] 客户端已断开连接");
                    break;
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

    // ==========================================
    // 任务 B：客户端前台运行
    // ==========================================
    // 等待一小会儿确保服务端 spawn 就绪 (实际上不需要，但加个 100ms 更稳)
    sleep(Duration::from_millis(100)).await;

    println!("🔵 [Client] 正在连接服务端...");
    // 调整 1：这里传入引用 &ticket
    client.start_connect(&ticket).await?; 
    println!("🟢 [Client] 连接成功！");

    // 客户端发送消息
    println!("🔵 [Client] 发送消息 '123'...");
    client.send(b"123".to_vec()).await?;

    // 调整 2：让客户端也接收一下服务端的 "ping from server"
    // 这样才能证明是【双工】(双向) 通信！
    match client.recv().await {
        Ok(Some(data)) => {
            println!("📬 [Client] 收到 text: {}", String::from_utf8_lossy(&data));
        }
        _ => println!("⚠️ [Client] 没收到服务端消息"),
    }

    // 给个短暂的延迟，让标准输出 (println) 飞一会儿，防止截断
    sleep(Duration::from_millis(500)).await;

    // 客户端主动关闭连接，这会触发服务端收到 Ok(None) 并退出 loop
    println!("🔵 [Client] 主动断开连接并退出...");
    client.close().await;

    // 等待服务端任务彻底结束
    let _ = accept_task.await;
    println!("\n✅ 测试圆满结束");

    Ok(())
}