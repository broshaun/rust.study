use super::stream::{Cmd, Task};
use async_lock::RwLock;
use tauri::{ipc::Channel, Emitter};
use tokio::sync::{mpsc, oneshot};

pub struct AppState {
    pub tx: RwLock<Option<mpsc::Sender<Cmd>>>,
    pub task: RwLock<Option<Task>>,
}

impl AppState {
    pub fn new() -> Self {
        let tx = RwLock::new(None);
        let task = RwLock::new(None);
        Self { tx, task }
    }
}
/**
 * 启动任务
 * 启动信息监听
 */
#[tauri::command]
pub async fn p2p_start(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let mut task_guard = state.task.write().await;
    let mut tx_guard = state.tx.write().await;

    let task = task_guard.take().unwrap_or_else(Task::new);
    let (tx, rx) = mpsc::channel(10);

    task.manage(rx).await;

    *tx_guard = Some(tx);
    *task_guard = Some(task);

    Ok("启动任务".to_owned())
}
/**
 * 停止任务
 */
#[tauri::command]
pub async fn p2p_stop(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let mut task_guard = state.task.write().await;
    if let Some(ts) = task_guard.take() {
        ts.stop().await;
    }
    let mut tx_guard = state.tx.write().await;
    if let Some(tx) = tx_guard.take() {
        drop(tx);
    }

    Ok("关闭任务".to_owned())
}
/**
 * 测试发送消息
 */
#[tauri::command]
pub async fn p2p_test(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let guard = state.task.read().await;
    let Some(ts) = guard.as_ref() else {
        return Err("未启动任务".to_string());
    };
    let a = ts.info();
    Ok(a)
}


/**
 * 测试发送消息
 */
#[tauri::command]
pub async fn p2p_state(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let tx_guard = state.tx.read().await;
    let Some(tx) = tx_guard.as_ref() else {
        return Err("未启动通道".to_string());
    };

    let (rtx, rrx) = oneshot::channel();
    let _a = tx.send(Cmd::Get { reply: rtx }).await;

    if let Ok(node) = rrx.await{
        let b= node.get_state().await;
        let c = format!("{:?}",b);
        return Ok(c);
    };

    Ok("".to_string())

}

#[tauri::command]
pub async fn p2p_start_accept(
    state: tauri::State<'_, AppState>,
    on_data: Channel<Vec<u8>>,
) -> Result<String, String> {
    let tx_guard = state.tx.read().await;
    let Some(tx) = tx_guard.as_ref() else {
        return Err("未启动通道".to_string());
    };

    

    let (rtx, rrx) = oneshot::channel();
    let _a = tx.send(Cmd::Accept { reply: rtx }).await;
    
    let node = match rrx.await{
        Ok(t)=>t,
        Err(e)=>{
            return Err(format!("{:?}",e));
        }
    };




    let task_guard = state.task.read().await;
    let Some(ts) = task_guard.as_ref() else {
        return Err("未启动节点（后台任务）".to_string());
    };

    ts.task.spawn(async move {
        while let Some(data) = node.recv().await {
            if let Err(e) = on_data.send(data) {
                eprintln!("前端通道发送失败:{:?}", e);
            };
        }
    });

    Ok("✅ 后台监听已启动，等待客户端连接".into())
}

#[tauri::command]
pub async fn p2p_start_connect(
    state: tauri::State<'_, AppState>,
    on_data: Channel<Vec<u8>>,
    addr: String,
) -> Result<String, String> {
    let tx_guard = state.tx.read().await;
    let Some(tx) = tx_guard.as_ref() else {
        return Err("未启动通道".to_string());
    };


    let (rtx, rrx) = oneshot::channel();
    let _a = tx.send(Cmd::Connect { ticket: addr, reply: rtx }).await;
    let node = match rrx.await{
        Ok(t)=>t,
        Err(e)=>{
            return Err(format!("{:?}",e));
        }
    };


    let task_guard = state.task.read().await;
    let Some(ts) = task_guard.as_ref() else {
        return Err("未启动任务".to_string());
    };

    ts.task.spawn(async move {
        while let Some(data) = node.recv().await {
            if let Err(e) = on_data.send(data) {
                eprintln!("前端通道发送失败:{:?}", e);
            };
        }
    });

    Ok("✅ 后台监听已启动，发起客户端连接".into())
}

#[tauri::command]
pub async fn p2p_send(state: tauri::State<'_, AppState>, data: Vec<u8>) -> Result<(), String> {
    let tx_guard = state.tx.read().await;
    let Some(tx) = tx_guard.as_ref() else {
        return Err("未启动通道".to_string());
    };

    let (rtx, rrx) = oneshot::channel();
    let _a = tx.send(Cmd::Get { reply: rtx }).await;

    if let Ok(node) = rrx.await{
        let b= node.send(data).await;
        match b {
            Ok(())=>{
                return Ok(());
            },
            Err(e)=>{
                let a = format!("{:?}",e);
                return Err(a);
            }
            
        }
    };
    Ok(())
}

/**
 * 节点地址详情
 */
// #[tauri::command]
// pub async fn p2p_info(state: tauri::State<'_, AppState>) -> Result<String, String> {

//     let task_guard = state.task.read().await;
//     let Some(ts) = task_guard.as_ref() else {
//         return Err("未启动任务".to_string());
//     };
//     let a = ts.info();
//     Ok(a)
// }

#[tauri::command]
pub async fn p2p_get_ticket(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let tx_guard = state.tx.read().await;
    let Some(tx) = tx_guard.as_ref() else {
        return Err("未启动通道".to_string());
    };

    let (rtx, rrx) = oneshot::channel();
    let _a = tx.send(Cmd::Get { reply: rtx }).await;
    if let Ok(node) = rrx.await{
        let ticket = node.get_ticket();
        return Ok(ticket);
    };

    return Ok("".to_string());
    
}


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
