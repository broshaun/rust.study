use anyhow::Result;
use iroh::{
    endpoint::{presets, Connection},
    Endpoint, EndpointAddr,
};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

const ALPN: &[u8] = b"ping/0";

pub async fn run_client(addr: EndpointAddr) -> Result<()> {
    let ep = Endpoint::bind(presets::N0).await?;
    let conn: Connection = ep.connect(addr, ALPN).await?;

    println!("client connected");

    let (mut send, mut recv) = conn.open_bi().await?;

    send.write_all(b"ping").await?;
    send.finish()?;

    let resp = recv.read_to_end(16).await?;
    println!("client recv: {:?}", std::str::from_utf8(&resp));

    ep.close().await;
    Ok(())
}