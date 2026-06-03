use regex::Regex;
use std::{path::PathBuf, sync::LazyLock};
use tauri::{AppHandle, Manager};

const CACHE_DIR: &str = "images";

static IMAGE_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?i)^[a-f0-9]{32}\.(jpg|jpeg|png|webp|gif)$").unwrap());

fn file_name(url: &str) -> Result<String, String> {
    url.split('?')
        .next()
        .and_then(|s| s.rsplit('/').next())
        .filter(|name| IMAGE_RE.is_match(name))
        .map(str::to_string)
        .ok_or_else(|| "Invalid image url".into())
}

fn cache_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|p| p.join(CACHE_DIR))
        .map_err(|e| e.to_string())
}

async fn download(url: &str, path: &PathBuf) -> Result<(), String> {
    let res = reqwest::get(url).await.map_err(|e| e.to_string())?;
    if !res.status().is_success() {
        return Err(format!("HTTP {}", res.status()));
    }
    let is_image = res
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .is_some_and(|v| v.starts_with("image/"));
    if !is_image {
        return Err("Response is not an image".into());
    }
    let tmp = path.with_extension("tmp");
    let bytes = res.bytes().await.map_err(|e| e.to_string())?;
    tokio::fs::write(&tmp, bytes)
        .await
        .map_err(|e| e.to_string())?;
    tokio::fs::rename(&tmp, path)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_image_cached(app: AppHandle, url: String) -> Result<String, String> {
    let name = file_name(&url)?;
    let dir = cache_dir(&app)?;
    let path = dir.join(name);
    if tokio::fs::metadata(&path).await.is_err() {
        tokio::fs::create_dir_all(&dir)
            .await
            .map_err(|e| e.to_string())?;
        download(&url, &path).await?;
    }
    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
pub async fn clear_image_cache(app: AppHandle) -> Result<(), String> {
    let dir = cache_dir(&app)?;
    match tokio::fs::remove_dir_all(dir).await {
        Ok(_) => Ok(()),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
