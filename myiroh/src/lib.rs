use anyhow::Result;
use iroh::{
    endpoint::{presets, Connection},
    Endpoint, EndpointAddr,
};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

const ALPN: &[u8] = b"ping/0";

pub async fn start_server() -> Result<(Endpoint, EndpointAddr)> {
    let ep = Endpoint::builder(presets::N0)
        .alpns(vec![ALPN.to_vec()])
        .bind()
        .await?;

    ep.online().await;

    let addr = ep.addr();
    Ok((ep, addr))
}

pub async fn server_once(ep: Endpoint) -> Result<()> {
    let incoming = ep.accept().await.expect("no incoming connection");
    let conn = incoming.await?;

    let (mut send, mut recv) = conn.accept_bi().await?;

    let mut buf = [0u8; 4];
    recv.read_exact(&mut buf).await?;

    if &buf == b"ping" {
        send.write_all(b"pong").await?;
        send.finish()?;
    }

    Ok(())
}

pub async fn client_ping(addr: EndpointAddr) -> Result<Vec<u8>> {
    let ep = Endpoint::bind(presets::N0).await?;
    ep.online().await;

    let conn: Connection = ep.connect(addr, ALPN).await?;
    let (mut send, mut recv) = conn.open_bi().await?;

    send.write_all(b"ping").await?;
    send.finish()?;

    let resp = recv.read_to_end(16).await?;
    ep.close().await;

    Ok(resp)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_ping() {
        let (server_ep, addr) = start_server().await.unwrap();

        let server_task = tokio::spawn(async move {
            server_once(server_ep).await.unwrap();
        });

        let resp = client_ping(addr).await.unwrap();
        assert_eq!(resp, b"pong");

        server_task.await.unwrap();
    }
}