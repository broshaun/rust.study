use super::stream::{P2PNode,P2PState};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{ipc::Channel, Emitter};
use tokio::sync::{watch, RwLock};

#[derive(Default)]
pub struct AppState {
    // pub is_online: AtomicBool,
    pub p2p_node: RwLock<Option<P2PNode>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            p2p_node: RwLock::new(None),
        }
    }
}

/**
 * 启动节点
 */
#[tauri::command]
pub async fn p2p_start(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let mut lock = state.p2p_node.write().await;
    let Ok(node) = P2PNode::new().await else {
        return Err("启动节点失败".to_string());
    };
    *lock = Some(node);
    Ok(" P2P节点启动成功".to_string())
}

/**
 * 安全停止节点
 */
#[tauri::command]
pub async fn p2p_stop(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let mut guard = state.p2p_node.write().await;
    let Some(node) = guard.as_ref() else {
        return Err("未启动节点".to_string());
    };
    node.close().await;
    *guard = None;
    Ok("关闭节点".to_owned())
}

/**
 * 启动节点信息
 */
#[tauri::command]
pub async fn p2p_state(state: tauri::State<'_, AppState>) -> Result<P2PState, String> {
    let guard = state.p2p_node.read().await;
    let Some(node) = guard.as_ref() else {
        return Err("未启动节点".to_string());
    };

    Ok(node.p2p_state())
}

/**
 * 节点地址详情
 */
#[tauri::command]
pub async fn p2p_info(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let guard = state.p2p_node.read().await;
    if let Some(p2p) = guard.as_ref() {
        let ticket = p2p.get_info();
        return Ok(ticket);
    };
    Ok("".to_owned())
}


#[tauri::command]
pub async fn p2p_get_ticket(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let guard = state.p2p_node.read().await;
    if let Some(p2p) = guard.as_ref() {
        let ticket = p2p.get_ticket();
        return Ok(ticket);
    };
    Ok("".to_owned())
}

/**
 * 启动监听后会无限循环，内不会执行到最后
 */
#[tauri::command]
pub async fn p2p_start_accept(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let guard = state.p2p_node.read().await;
    let Some(node) = guard.as_ref() else {
        return Err("未启动节点".to_string());
    };

    let node2 = node.clone();

    tokio::spawn(async move {
        let _ = node2.start_accept().await;
    });

    Ok("✅ 后台监听已启动，等待客户端连接".into())
}

#[tauri::command]
pub async fn p2p_start_connect(
    state: tauri::State<'_, AppState>,
    addr: String,
) -> Result<String, String> {
    let guard = state.p2p_node.read().await;
    let Some(node) = guard.as_ref() else {
        return Err("未启动节点".to_string());
    };

    if let Err(e) = node.start_connect(&addr).await {
        return Err(format!("连接失败{:#?}", e));
    };
    Ok("✅ 发起客户端连接".into())
}

#[tauri::command]
pub async fn p2p_send(state: tauri::State<'_, AppState>, data: Vec<u8>) -> Result<(), String> {
    let rgch = state.p2p_node.read().await;
    let Some(ch) = rgch.as_ref() else {
        return Err("未启动通道".to_string());
    };
    if let Err(e) = ch.send(data).await {
        return Err(format!("发送错误{:?}", e));
    };
    Ok(())
}

#[tauri::command]
pub async fn p2p_recv(
    state: tauri::State<'_, AppState>,
    on_data: Channel<Vec<u8>>,
) -> Result<(), String> {
    let rgch = state.p2p_node.read().await;
    let Some(ch) = rgch.as_ref() else {
        return Err("未启动通道".to_string());
    };
    loop {
        if let Some(data) = ch.recv().await {
            if let Err(e) = on_data.send(data) {
                return Err(format!("前端通道发送失败:{:?}", e));
            };
        };
    }
}




#[tauri::command]
// 这里加个 window 参数！！！
pub async fn send_to_this_window(window: tauri::Window) {
    // 给【当前这个窗口】发消息
    let (status_tx, mut status_rx) = watch::channel(true);
    let a = status_tx.send(false);
    // let a = status_tx.send(false);
    let status_rx2 = status_rx.clone();
    // let a = status_rx2.borrow();

    match status_rx.changed().await {
        Ok(a) => {
            // 获取最新状态
            let state = status_rx.borrow();
            println!("当前最新状态：{:?}", state);
            window.emit("state-change", *state).ok();
        }
        Err(a) => {
            println!("通道关闭，退出");
            // return false;
        }
    };

    window
        .emit(
            "message",                     // 事件名字
            "我是 Rust，我只发给这个窗口", // 数据
        )
        .unwrap();
}

#[tauri::command]
pub async fn send_to_message(state: tauri::State<'_, AppState>, on_data: Channel<bool>) -> Result<(), String>  {
    let (status_tx, mut status_rx) = watch::channel(true);
    let _ = status_tx.send(false);
    loop {
        match status_rx.changed().await {
            Ok(_a) => {
                let state = status_rx.borrow();
                println!("当前最新状态：{:?}", state);
                if let Err(e) = on_data.send(*state) {
                    return Err(format!("前端通道发送失败:{:?}", e));
                };
            }
            Err(_a) => {
                println!("通道关闭，退出");
            }
        };
    }
}

