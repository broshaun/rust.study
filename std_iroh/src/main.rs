mod ping;
mod stream;

use anyhow::{bail, Context, Result};
use std::env;
use stream::stream::{P2PNode};
use tokio::io::{self, AsyncBufReadExt, BufReader};
use tokio::signal;

#[tokio::main]
async fn main() -> Result<()> {
    let mut args = env::args();
    let _bin = args.next();
    let mode = args.next().unwrap_or_default();

    match mode.as_str() {
        "server" => run_server().await,
        "client" => {
            let ticket = args
                .next()
                .context("缺少 ticket。用法: cargo run -- client <ticket>")?;
            run_client(ticket).await
        }
        _ => {
            print_usage();
            bail!("无效参数")
        }
    }
}

fn print_usage() {
    eprintln!("用法:");
    eprintln!("  cargo run -- server");
    eprintln!("  cargo run -- client <ticket>");
}

async fn run_client(ticket: String) -> Result<()> {
    println!("=== Iroh Client 模式 ===\n");

    let client = P2PNode::new().await?;
    println!("Client is_online: {}", client.is_online());

    println!("🔵 [Client] 正在连接服务端...");
    client.start_connect(&ticket).await?;
    println!("🟢 [Client] 连接成功！");
    println!("请输入消息并回车发送，按 Ctrl+C 退出。\n");

    let ch_recv = client.clone();
    let ch_send = client.clone();

    let recv_task = tokio::spawn(async move {
        loop {
            match ch_recv.recv().await {
                Some(data) => {
                    println!("\n📬 [Client] 收到: {}", String::from_utf8_lossy(&data));
                    print!("> ");
                    use std::io::Write;
                    std::io::stdout().flush().ok();
                }
                None => {
                    eprintln!("\n⚠️ [Client] 接收失败 / 连接结束");
                    break;
                }
            }
        }
    });

    let stdin = BufReader::new(io::stdin());
    let mut lines = stdin.lines();

    loop {
        print!("> ");
        use std::io::Write;
        std::io::stdout().flush().ok();

        tokio::select! {
            _ = signal::ctrl_c() => {
                println!("\n🛑 [Client] 收到 Ctrl+C，准备退出...");
                client.close().await;
                break;
            }

            line = lines.next_line() => {
                let Some(line) = line? else {
                    break;
                };

                let msg = line.trim();
                if msg.is_empty() {
                    continue;
                }

                if let Err(e) = ch_send.send(msg.as_bytes().to_vec()).await {
                    eprintln!("🔴 [Client] 发送失败: {:#?}", e);
                    break;
                }

                println!("✅ [Client] 已发送: {}", msg);

                if msg.eq_ignore_ascii_case("exit") {
                    println!("🔵 [Client] 主动断开连接并退出...");
                    break;
                }
            }
        }
    }

    recv_task.abort();
    println!("🛑 [Client] 节点已关闭");
    Ok(())
}

async fn run_server() -> Result<()> {
    println!("=== Iroh Server 模式 ===\n");

    let server = P2PNode::new().await?;
    let ticket = server.get_ticket();
    println!("Server is_online: {}", server.is_online());

    println!("\n===== SERVER TICKET =====");
    println!("cargo run -- client {ticket}");
    println!("=========================\n");
    println!("请复制上面的 ticket，在另一个终端运行 client。\n");

    loop {
        println!("🟡 [Server] 等待新的客户端连接...");

        if let Err(e) = server.start_accept().await {
            eprintln!("🔴 [Server] accept 失败: {:#?}", e);
            continue;
        }

        println!("🟢 [Server] 已接受客户端连接！");

        loop {
            println!("接收信息");
            match server.recv().await {
                Some(data) => {
                    let text = String::from_utf8_lossy(&data);
                    println!("📬 [Server] 收到 bytes: {:?}", data);
                    println!("📬 [Server] 收到 text: {}", text);

                    if text.trim().eq_ignore_ascii_case("exit") {
                        println!("🟡 [Server] 客户端请求退出");
                        break;
                    }

                    let reply = format!("echo from server: {}", text);
                    if let Err(e) = server.send(reply.into_bytes()).await {
                        eprintln!("🔴 [Server] 回复失败: {:#?}", e);
                        break;
                    }
                }
                None => {
                    eprintln!("🔴 [Server] 当前连接结束");
                    break;
                }
            }
        }

        println!("🟡 [Server] 本次会话结束，继续等待下一个客户端...\n");
    }
}