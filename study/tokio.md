

---

# 📘 Tokio 快速入门笔记（实用版）

---

# 🧠 1. Tokio 是什么

Tokio 是 Rust 的**异步运行时（Async Runtime）**，主要作用：

* 让 `async/await` 能真正执行
* 提供异步工具（定时器 / 网络 / 任务 / channel）

---

# 🚀 2. 安装依赖

```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
```

---

# ▶️ 3. 最小程序

```rust
#[tokio::main]
async fn main() {
    println!("hello tokio");
}
```

### 作用：

* 创建异步运行时
* 允许 `main` 使用 `.await`

---

# 🔁 4. async / await

```rust
async fn say_hi() {
    println!("hi");
}

#[tokio::main]
async fn main() {
    say_hi().await;
    println!("done");
}
```

---

# ⏱️ 5. 异步延时

```rust
use tokio::time::{sleep, Duration};

sleep(Duration::from_secs(1)).await;
```

✔ 不阻塞线程
✔ 非阻塞等待

---

# 🔥 6. 并发任务（spawn）

```rust
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    let task = tokio::spawn(async {
        sleep(Duration::from_secs(1)).await;
        println!("task done");
    });

    println!("main running");

    task.await.unwrap();
}
```

---

# ⚡ 7. 多任务并发

```rust
let t1 = tokio::spawn(async {
    println!("task1");
});

let t2 = tokio::spawn(async {
    println!("task2");
});
```

---

# 📦 8. 返回值

```rust
let task = tokio::spawn(async {
    123
});

let result = task.await.unwrap();
```

---

# ❗ 9. 错误处理

```rust
use anyhow::Result;

async fn work() -> Result<()> {
    Ok(())
}

#[tokio::main]
async fn main() -> Result<()> {
    work().await?;
    Ok(())
}
```

---

# ⚡ 10. 同时执行（join）

```rust
use tokio::join;

join!(task1(), task2());
```

---

# 🔄 11. Channel 通信

```rust
use tokio::sync::mpsc;

let (tx, mut rx) = mpsc::channel(10);

tokio::spawn(async move {
    tx.send("hello").await.unwrap();
});

let msg = rx.recv().await;
```

---

# 🧠 12. 核心概念总结

```text
async fn = 定义任务
.await   = 等待结果
spawn    = 开新任务
```

---

# ⚠️ 13. 常见错误

## ❌ 忘记 await

```rust
sleep(Duration::from_secs(1)); // 错
```

```rust
sleep(Duration::from_secs(1)).await; // 对
```

---

## ❌ 在普通函数中 await

```rust
fn main() {
    sleep(...).await; // 错
}
```

---

## ❌ spawn 不加 move

```rust
tokio::spawn(async move { ... });
```

---

# 🔥 14. 常用 API

```rust
tokio::spawn()
tokio::time::sleep()
tokio::sync::mpsc
tokio::net
```

---

# 🌐 15. 和你当前 iroh 的关系

你现在看到的：

```rust
Endpoint::bind(...).await
endpoint.online().await
tokio::spawn(...)
```

本质就是：

* `await` → 网络操作
* `spawn` → 后台监听
* `tokio` → 驱动整个系统

---

# 🎯 16. 最重要理解

```text
Tokio = Rust 的“异步操作系统”
```

---

# 📌 17. 最小思维模型

```text
写 async 函数 → 用 await 等 → 用 spawn 并发
```

---

# 🚀 18. 推荐你当前掌握的 4 个点

✔ `#[tokio::main]`
✔ `async fn`
✔ `.await`
✔ `tokio::spawn`

---

# 🧾 19. 一句话总结

> Tokio = 让 Rust 可以写并发网络程序的核心基础

---

如果你下一步想进阶，我可以帮你做：

👉 **Tokio + iroh + P2P通信完整模板（实战版）**
直接帮你打通从“连接 → 发消息 → 接收”的全过程 👍
