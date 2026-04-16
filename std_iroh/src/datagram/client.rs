use anyhow::Result;
use bytes::Bytes;
use iroh::endpoint::Connection;
use tokio::time::{sleep, Duration};

pub async fn client_send_datagram(conn: Connection) -> Result<()> {
    println!("客户端发送 datagram...");

    // 故意打乱发送时间
    let msgs = vec![
        (300, "A"),
        (100, "B"),
        (0, "C"),
    ];

    for (delay, msg) in msgs {
        let conn = conn.clone();

        tokio::spawn(async move {
            sleep(Duration::from_millis(delay)).await;

            if let Err(e) = conn.send_datagram(Bytes::from(msg)) {
                println!("发送失败: {:?}", e);
                return;
            }

            println!("已发送: {}", msg);
        });
    }

    Ok(())
}