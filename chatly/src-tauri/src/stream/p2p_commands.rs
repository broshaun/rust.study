use super::stream::P2PNode;
use anyhow::{anyhow, Context, Result};
use async_lock::RwLock;
use serde::Serialize;
use std::sync::{Arc, Weak};
use tauri::{ipc::Channel, Emitter};
use tokio_util::sync::CancellationToken;
use tokio_util::task::TaskTracker;

#[derive(Debug, Clone, Serialize)]
pub enum Message {
    Test,
    Err(String),
    Data,
}

pub struct AppState {
    pub tx: flume::Sender<Message>,
    pub rx: flume::Receiver<Message>,
    pub node: RwLock<Option<P2PNode>>,
    pub task: RwLock<Option<TaskTracker>>,
    pub token: RwLock<Option<CancellationToken>>,
}

impl AppState {
    pub fn new() -> Self {
        let (tx, rx) = flume::bounded::<Message>(10);
        let node = RwLock::new(None);
        let task = RwLock::new(None);
        let token = RwLock::new(None);
        Self {
            tx,
            rx,
            node,
            task,
            token,
        }
    }
}
/**
 * 启动任务
 * 启动信息监听
 */
#[tauri::command]
pub async fn p2p_start(
    state: tauri::State<'_, AppState>,
    on_data: Channel<Message>,
) -> Result<String, String> {
    let mut token_guard = state.token.write().await;
    if let Some(token) = token_guard.take() {
        token.cancel();
    }

    let mut task_guard = state.task.write().await;
    if let Some(task) = task_guard.take() {
        task.close();
        task.wait().await;
    }

    let mut node_guard = state.node.write().await;
    if let Some(node) = node_guard.take() {
        drop(node);
    }

    let task = TaskTracker::new();
    let token = CancellationToken::new();
    let Ok(nede) = P2PNode::new().await else {
        return Err("启动节点失败".to_owned());
    };

    let atoken = token.clone();
    let rx = state.rx.clone();
    task.spawn(async move {
        loop {
            tokio::select! {
                _ = atoken.cancelled() => {
                        break;
                },
                Ok(state) = rx.recv_async() => {
                    if let Err(e) = on_data.send(state) {
                        eprintln!("消息通知发送失败:{:?}", e);
                        break;
                    };
                }
            }
        }
    });

    *node_guard = Some(nede);
    *task_guard = Some(task);
    *token_guard = Some(token);

    Ok("启动任务".to_owned())
}
/**
 * 停止任务
 */
#[tauri::command]
pub async fn p2p_stop(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let mut token_guard = state.token.write().await;
    if let Some(token) = token_guard.take() {
        token.cancel();
    };

    let mut guard = state.task.write().await;
    if let Some(tracker) = guard.take() {
        tracker.close();
        tracker.wait().await;
    };

    let mut node_guard = state.node.write().await;
    if let Some(node) = node_guard.take() {
        drop(node);
    };

    Ok("关闭节点".to_owned())
}
/**
 * 测试发送消息
 */
#[tauri::command]
pub async fn p2p_test(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let guard = state.task.read().await;
    let Some(task) = guard.as_ref() else {
        return Err("未启动任务".to_string());
    };
    let a = task.is_closed();
    state.tx.send_async(Message::Test).await;
    Ok(format!("Task closed {}", a))
}

#[tauri::command]
pub async fn p2p_start_accept(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let tesk_guard = state.task.read().await;
    let Some(task) = tesk_guard.as_ref() else {
        return Err("未启动任务".to_string());
    };

    let tx = state.tx.clone();

    let task = task.clone();

    // let node = P2PNode::new().await.unwrap();

    let node_guard = state.node.read().await;
    let Some(node) = node_guard.as_ref() else {
        return Err("未启动任务".to_string());
    };

    let node = node.clone();

    let a = node.get_info();
    let b = node.get_ticket();

    task.spawn(async move {
        let a = node.start_accept().await;
    });

    Ok("✅ 后台监听已启动，等待客户端连接".into())
}

#[tauri::command]
pub async fn p2p_start_connect(
    state: tauri::State<'_, AppState>,
    addr: String,
) -> Result<String, String> {
    let task_guard = state.task.read().await;
    let Some(task) = task_guard.as_ref() else {
        return Err("未启动任务".to_string());
    };

    let node_guard = state.node.read().await;
    let Some(node) = node_guard.as_ref() else {
        return Err("未启动任务".to_string());
    };

    let a = node.get_info();
    let b = node.get_ticket();
    let node = node.clone();

    task.spawn(async move {
        if let Err(e) = node.start_connect(&addr).await {
            eprintln!("连接失败{:#?}", e);
        };
    });

    Ok("✅ 发起客户端连接".into())
}

#[tauri::command]
pub async fn p2p_send(state: tauri::State<'_, AppState>, data: Vec<u8>) -> Result<(), String> {

    let node_guard = state.node.read().await;
    let Some(node) = node_guard.as_ref() else {
        return Err("未启动任务".to_string());
    };

    if let Err(e) = node.send(data).await {
        return Err(format!("发送错误{:?}", e));
    };
    Ok(())
}

#[tauri::command]
pub async fn p2p_recv(
    state: tauri::State<'_, AppState>,
    on_data: Channel<Vec<u8>>,
) -> Result<(), String> {
    let node_guard = state.node.read().await;
    let Some(node) = node_guard.as_ref() else {
        return Err("未启动任务".to_string());
    };
    let ch = node.clone();
    loop {
        if let Some(data) = ch.recv().await {
            if let Err(e) = on_data.send(data) {
                return Err(format!("前端通道发送失败:{:?}", e));
            };
        };
    }
}

/**
 * 节点地址详情
 */
#[tauri::command]
pub async fn p2p_info(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let node_guard = state.node.read().await;
    let Some(node) = node_guard.as_ref() else {
        return Err("未启动任务".to_string());
    };
    let a = node.get_info();
    Ok(a)
}

#[tauri::command]
pub async fn p2p_get_ticket(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let node_guard = state.node.read().await;
    let Some(node) = node_guard.as_ref() else {
        return Err("未启动任务".to_string());
    };

    let ticket = node.get_ticket();
    return Ok(ticket);


}

/**
 * 启动监听后会无限循环，内不会执行到最后
 */

/**
 * 发送单条信息
 */
#[tauri::command]
pub async fn send_to_this_window(window: tauri::Window) {
    window
        .emit(
            "message",                     // 事件名字
            "我是 Rust，我只发给这个窗口", // 数据
        )
        .unwrap();
}
