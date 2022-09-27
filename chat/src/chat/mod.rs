use actix_web::{get, Responder};

pub mod amq;
pub mod jwt;

#[get("/")]
async fn hello() -> impl Responder {
    "Hello Actix Web !!!"
}
