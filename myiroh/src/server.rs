use anyhow::Result;
use iroh::{
    endpoint::{presets, Connection},
    Endpoint, EndpointAddr,
};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

const ALPN: &[u8] = b"ping/0";

pub async fn get_server_addr() -> Result<(Endpoint, EndpointAddr)> {
    let ep = Endpoint::builder(presets::N0)
        .alpns(vec![ALPN.to_vec()])
        .bind()
        .await?;

    let addr = ep.addr();
    Ok((ep, addr))
}

pub async fn run_server(ep: Endpoint) -> Result<()> {
    println!("启动监听");

    loop {
        let incoming = ep.accept().await.expect("no incoming");
        let conn: Connection = incoming.await?;

        tokio::spawn(async move {
            while let Ok((mut send, mut recv)) = conn.accept_bi().await {
                let mut buf = [0u8; 4];

                if recv.read_exact(&mut buf).await.is_err() {
                    break;
                }

                println!("server recv: {:?}", std::str::from_utf8(&buf));

                if &buf == b"ping" {
                    let _ = send.write_all(b"pong").await;
                    let _ = send.finish();
                }
            }
        });
    }
}

pub async fn get_public_ip() -> Result<String> {
    let ip = reqwest::get("https://api.ipify.org")
        .await?
        .text()
        .await?;
    Ok(ip)
}