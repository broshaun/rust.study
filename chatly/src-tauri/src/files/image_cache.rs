use regex::Regex;
use serde::Serialize;
use std::{path::PathBuf, sync::LazyLock};
use tauri::{AppHandle, Manager};

const CACHE_DIR: &str = "images";

static IMAGE_NAME_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)^[a-f0-9]{32}\.(jpg|jpeg|png|webp|gif)$").unwrap()
});

#[derive(Serialize)]
pub struct CachedImage {
    pub path: String,
    pub file_name: String,
}

fn file_name_from_url(url: &str) -> Result<String, String> {
    let file_name = url
        .split('?')
        .next()
        .and_then(|s| s.rsplit('/').next())
        .filter(|name| IMAGE_NAME_RE.is_match(name))
        .ok_or("Invalid image url or file name")?;

    Ok(file_name.to_string())
}

fn image_cache_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|dir| dir.join(CACHE_DIR))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_cached_image(app: AppHandle, url: String) -> Result<CachedImage, String> {
    let file_name = file_name_from_url(&url)?;
    let dir = image_cache_dir(&app)?;
    let file_path = dir.join(&file_name);

    if tokio::fs::metadata(&file_path).await.is_ok() {
        return Ok(CachedImage {
            path: file_path.to_string_lossy().into_owned(),
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

    let is_image = response
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .is_some_and(|v| v.starts_with("image/"));

    if !is_image {
        return Err("Response is not an image".into());
    }

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;

    let tmp_path = file_path.with_extension("tmp");

    tokio::fs::write(&tmp_path, bytes)
        .await
        .map_err(|e| e.to_string())?;

    tokio::fs::rename(&tmp_path, &file_path)
        .await
        .map_err(|e| e.to_string())?;

    Ok(CachedImage {
        path: file_path.to_string_lossy().into_owned(),
        file_name,
    })
}

#[tauri::command]
pub async fn clear_image_cache(app: AppHandle) -> Result<(), String> {
    let dir = image_cache_dir(&app)?;

    match tokio::fs::remove_dir_all(dir).await {
        Ok(_) => Ok(()),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}