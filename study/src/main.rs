use mylib::add;

#[tokio::main]
async fn main() {
    println!("Hello, world!");

    let num = add(1, 2);
    println!("add is {}", num);


}