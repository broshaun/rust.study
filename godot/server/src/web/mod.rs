use axum::routing::{get, post};
use axum::Router;
use mongodb::{options::ClientOptions, Client, Database};
use std::sync::Arc;
use axum::{extract::Extension, response::IntoResponse};
use serde::{Deserialize, Serialize};
use std::str;
use axum::extract::{Json, Path, Query};
use mongodb::{
    bson,
    bson::oid::ObjectId,
    bson::{doc, Document},
    options::FindOptions,
};
use crate::apple::Result;
use crate::apple::model;
use crate::apple::utils;
use crate::apple::conf;

mod room;
mod user;
pub struct State {
    pub db: Database,
}

use conf::{db,ipadd};

#[tokio::main]
pub async fn start() {
    println!("启动tcptest");
    let mut client_options = ClientOptions::parse(db::Conf::mongo()).await.unwrap();
    client_options.app_name = Some("Godot".to_string());
    let client = Client::with_options(client_options).unwrap();
    let db = client.database("DB_GODOT");

    let state = Arc::new(State { db });

    let app = Router::new()
        .route("/login", post(user::login))
        .route("/upstats", post(user::up_stats))
        .route("/upaction", post(user::up_action))
        .route("/room", post(room::update).delete(room::leave))
        .layer(Extension(state));

    axum::Server::bind(&ipadd::Conf::web()).serve(app.into_make_service()).await.unwrap();
}
