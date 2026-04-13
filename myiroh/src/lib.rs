pub mod server;



#[cfg(test)]
mod tests {
    use crate::server;

    #[tokio::test]
    async fn test_direct_addr() {
        let (server_ep, addr) = server::get_server_addr().await.unwrap();

        println!("SS = {:#?}", server_ep);
        println!("ADDR = {:#?}", addr);
          
    }
}