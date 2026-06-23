use super::{TaskInfo, TaskManager};
use std::time::Duration;

/// 创建一个测试后台任务
#[tauri::command]
pub async fn spawn_demo_task(
    name: String,
    interval_secs: Option<u64>,
    tasks: tauri::State<'_, TaskManager>,
) -> Result<(), String> {
    let interval_secs = interval_secs.unwrap_or(5);

    tasks.spawn(name.clone(), move |token| async move {
        loop {
            tokio::select! {
                _ = token.cancelled() => {
                    println!("[task cancelled] {name}");
                    break;
                }

                _ = tokio::time::sleep(Duration::from_secs(interval_secs)) => {
                    println!("[task running] {name}");
                }
            }
        }
    })
}

/// 查看所有任务
#[tauri::command]
pub async fn list_tasks(tasks: tauri::State<'_, TaskManager>) -> Result<Vec<TaskInfo>, ()> {
    Ok(tasks.list())
}

/// 取消指定任务
#[tauri::command]
pub async fn cancel_task(name: String, tasks: tauri::State<'_, TaskManager>) -> Result<(), String> {
    tasks.cancel(&name)
}

/// 取消全部任务
#[tauri::command]
pub async fn cancel_all_tasks(tasks: tauri::State<'_, TaskManager>) -> Result<(), String> {
    tasks.cancel_all();
    Ok(())
}

/// 下线，关闭所有
#[tauri::command]
pub async fn shutdown(tasks: tauri::State<'_, TaskManager>) -> Result<(), String> {
    tasks.shutdown().await;
    Ok(())
}
