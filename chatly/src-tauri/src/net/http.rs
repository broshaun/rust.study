use reqwest::{multipart, Client};
use serde::Deserialize;
use serde_json::Value;
use std::collections::HashMap;

#[derive(Deserialize)]
pub struct GetOptions {
    url: String,
    headers: Option<HashMap<String, String>>,
}

#[derive(Deserialize)]
pub struct PostOptions {
    url: String,
    headers: Option<HashMap<String, String>>,
    body: Option<Value>,
}

fn add_headers(
    mut req: reqwest::RequestBuilder,
    headers: Option<HashMap<String, String>>,
) -> reqwest::RequestBuilder {
    if let Some(headers) = headers {
        for (key, value) in headers {
            if key.trim().is_empty() || value.trim().is_empty() {
                continue;
            }

            req = req.header(key, value);
        }
    }

    req
}

async fn send(req: reqwest::RequestBuilder) -> Result<String, String> {
    let res = req
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = res.status();

    let text = res
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    if status.is_success() {
        Ok(text)
    } else {
        Err(format!("HTTP {}: {}", status.as_u16(), text))
    }
}

#[tauri::command]
pub async fn http_get(options: GetOptions) -> Result<String, String> {
    let req = add_headers(Client::new().get(options.url), options.headers);

    send(req).await
}

#[tauri::command]
pub async fn http_post(options: PostOptions) -> Result<String, String> {
    let mut req = add_headers(
        Client::new()
            .post(options.url)
            .header("Content-Type", "application/json"),
        options.headers,
    );

    if let Some(body) = options.body {
        req = req.json(&body);
    }

    send(req).await
}

#[tauri::command]
pub async fn http_upload(
    url: String,
    file_bytes: Vec<u8>,
    file_name: String,
) -> Result<String, String> {
    let form = multipart::Form::new().part(
        "file",
        multipart::Part::bytes(file_bytes).file_name(file_name),
    );

    let req = Client::new().post(url).multipart(form);

    send(req).await
}
