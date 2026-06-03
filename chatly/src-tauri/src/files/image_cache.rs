use regex::Regex;
use serde::Serialize;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const CACHE_DIR: &str = "images";

#[derive(Serialize)]
pub struct CachedImage {
    pub path: String,
    pub file_name: String,
}

fn valid_image_file_name(file_name: &str) -> bool {
    let re = Regex::new(r"(?i)^[a-f0-9]{32}\.(jpg|jpeg|png|webp|gif)$").unwrap();
    re.is_match(file_name)
}

fn get_file_name(url: &str) -> Result<String, String> {
    let clean_url = url.split('?').next().unwrap_or(url);
    let file_name = clean_url
        .split('/')
        .last()
        .ok_or("Invalid image url")?
        .to_string();

    if !valid_image_file_name(&file_name) {
        return Err("Invalid image file name".into());
    }

    Ok(file_name)
}

fn cache_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|p| p.join(CACHE_DIR))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_cached_image(app: AppHandle, url: String) -> Result<CachedImage, String> {
    let file_name = get_file_name(&url)?;
    let dir = cache_dir(&app)?;
    let file_path = dir.join(&file_name);

    if file_path.exists() {
        return Ok(CachedImage {
            path: file_path.to_string_lossy().to_string(),
            file_name,
        });
    }

    tokio::fs::create_dir_all(&dir)
        .await
        .map_err(|e| e.to_string())?;

    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("HTTP {}", response.status()));
    }

    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    if !content_type.starts_with("image/") {
        return Err("Response is not an image".into());
    }

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;

    tokio::fs::write(&file_path, bytes)
        .await
        .map_err(|e| e.to_string())?;

    Ok(CachedImage {
        path: file_path.to_string_lossy().to_string(),
        file_name,
    })
}

#[tauri::command]
pub async fn clear_image_cache(app: AppHandle) -> Result<(), String> {
    let dir = cache_dir(&app)?;

    if dir.exists() {
        tokio::fs::remove_dir_all(dir)
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}