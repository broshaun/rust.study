

## Tauri 前端和 Rust 通信只有 4 种核心方式：
- 命令调用 (Invoke)  
- 事件 (Event) 
- 数据流通道 (Channel)  
- 状态管理 (State)


### 1、命令调用 Invoke（前端 → Rust）
```rs
#[tauri::command]
fn hello(name: &str) -> String {
    format!("Hello {name}!")
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![hello])
        .run(tauri::generate_context!())
        .unwrap();
}
```
```js
import { invoke } from "@tauri-apps/api/commands";
function App() {
  const test = async () => {
    let res = await invoke("hello", { name: "张三" });
    alert(res);
  };

  return <button onClick={test}>调用 Rust</button>;
}
export default App;
```

### 2、事件 Event（Rust → 前端）
```rs
use tauri::{AppHandle, Emitter};
#[tauri::command]
fn send_event(app: AppHandle) {
    app.emit("my-event", "来自 Rust 的消息").unwrap();
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_event])
        .run(tauri::generate_context!())
        .unwrap();
}
```
```js
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/commands";
import { useEffect } from "react";
function App() {
  useEffect(() => {
    listen("my-event", (e) => {
      alert(e.payload);
    });
  }, []);

  return <button onClick={() => invoke("send_event")}>触发事件</button>;
}

export default App;
```

### 3、数据流通道 Channel（Rust → 前端 大量数据）
```rs
use tauri::Channel;

#[tauri::command]
fn set_channel(channel: Channel<Vec<u8>>) {
    // 实时发数据
    channel.send(vec![1,2,3,4]).unwrap();
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![set_channel])
        .run(tauri::generate_context!())
        .unwrap();
}
```
```js
import { Channel } from "@tauri-apps/api/core";
import { invoke } from "@tauri-apps/api/commands";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const channel = new Channel<Uint8Array>();

    // 接收 Rust 发来的数据
    channel.onmessage = (data) => {
      console.log("收到二进制：", data);
    };

    // 把通道传给 Rust
    invoke("set_channel", { channel });
  }, []);

  return <div>Channel 示例</div>;
}

export default App;
```

### 4、状态管理 State（Rust 全局共享数据）
```rs
use std::sync::{Arc, Mutex};
// 全局状态
#[derive(Default)]
struct Counter {
    num: Arc<Mutex<i32>>,
}
#[tauri::command]
fn add(state: tauri::State<Counter>) -> i32 {
    let mut n = state.num.lock().unwrap();
    *n += 1;
    *n
}

fn main() {
    tauri::Builder::default()
        .manage(Counter::default()) // 注册状态
        .invoke_handler(tauri::generate_handler![add])
        .run(tauri::generate_context!())
        .unwrap();
}
```
```js
import { invoke } from "@tauri-apps/api/commands";

function App() {
  const add = async () => {
    let res = await invoke("add");
    alert(res);
  };

  return <button onClick={add}>计数 +1</button>;
}

export default App;
```

### 总结
    Invoke：前端 → Rust
    Event：Rust → 前端
    Channel：Rust → 前端（大量数据 / 语音）
    State：Rust 全局共享数据