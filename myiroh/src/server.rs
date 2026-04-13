use anyhow::Result;
use iroh::{endpoint::presets, Endpoint, EndpointAddr};

pub async fn get_server_addr() -> Result<(Endpoint, EndpointAddr)> {
    let ep = Endpoint::builder(presets::N0)
        .alpns(vec![b"ping/0".to_vec()])
        .bind()
        .await?;

    let addr = ep.addr();

    // 打印
    println!("SERVER ADDR:{:#?}", addr);

    // 返回
    Ok((ep, addr))
}