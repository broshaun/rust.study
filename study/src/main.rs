use mylib::add;
// use mytest::test_struct;
use myiroh::server;

#[tokio::main]
async fn main() {
    println!("Hello, world!");
    let num = add(1, 2);
    println!("add is {}", num);

    // mytest create
    // test_struct::fn1();

    if let Ok((_ep, addr)) = server::get_server_addr().await{

        // println!("SERVER EP = {:#?}", _ep);
        println!("SERVER ADDR:{:#?}", addr);
    }else{
        println!("获取IP失败...");
    };


    if let Ok(ip) = server::get_public_ip().await {
        println!("pub ip is {:#?}", ip);
    } else {
        println!("获取Public IP失败...");
    }
}
