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

    let (_ep, addr) = server::get_server_addr().await.unwrap();
    println!("{:?}", addr);
}
