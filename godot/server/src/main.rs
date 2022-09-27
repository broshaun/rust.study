#[macro_use]
extern crate lazy_static;
mod udp;
mod web;
use std::thread;
mod apple;




fn main() {
    thread::spawn(||{ 
        udp::start();
    });
    web::start();
}
