use anyhow::Result;
use iroh::endpoint::Connection;

pub async fn server_recv_datagram(conn: Connection) -> Result<()> {
    println!("服务端开始接收 datagram...");

    loop {
        match conn.read_datagram().await {
            Ok(bytes) => {
                let msg = String::from_utf8_lossy(&bytes);
                println!("收到 datagram: {}", msg);
            }
            Err(e) => {
                println!("读取 datagram 失败: {:?}", e);
                break;
            }
        }
    }

    Ok(())
}