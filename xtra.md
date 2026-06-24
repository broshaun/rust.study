# Xtra 学习笔记

## 一句话理解

Xtra 本质上是：

```text
mpsc + 状态(State) + 消息(Message) + Handler
```

或者：

```text
Actor = 有状态的 Service
```

---

# 核心概念

## Actor

Actor 就是一个长期存活的对象。

```rust
#[derive(xtra::Actor)]
struct Printer {
    times: usize,
}
```

理解为：

```text
Actor = Service
```

例如：

```text
MqttActor
P2PActor
WebSocketActor
DeviceActor
```

---

## State

Actor 内部字段就是状态。

```rust
struct Printer {
    times: usize,
}
```

这里：

```rust
times
```

就是状态。

状态只能由 Actor 自己修改。

---

## Message

Message 就是命令。

```rust
struct SayHello(String);
```

相当于：

```rust
enum Cmd {
    SayHello(String)
}
```

所以：

```text
Message = Cmd
```

---

## Handler

消息处理器。

```rust
impl Handler<SayHello> for Printer {
    type Return = ();

    async fn handle(
        &mut self,
        msg: SayHello,
        _ctx: &mut Context<Self>,
    ) {
        self.times += 1;

        println!(
            "Hello {}, 第 {} 次调用",
            msg.0,
            self.times
        );
    }
}
```

相当于：

```rust
match cmd {
    Cmd::SayHello(...)
}
```

所以：

```text
Handler = match Cmd
```

---

## Address

Actor 地址。

```rust
Address<Printer>
```

相当于：

```rust
Sender<Cmd>
```

发送消息：

```rust
addr.send(...)
```

等价于：

```rust
tx.send(...)
```

所以：

```text
Address = Sender
```

---

## Mailbox

邮箱。

```rust
Mailbox::bounded(32)
```

相当于：

```rust
mpsc::channel(32)
```

作用：

```text
缓存消息
排队等待处理
```

所以：

```text
Mailbox = Receiver + Queue
```

---

# Actor 生命周期

## 创建

```rust
let (addr, mailbox) =
    Mailbox::bounded(32);

xtra::spawn_tokio(
    Printer::new(),
    (addr.clone(), mailbox),
);
```

---

## 发送消息

```rust
addr.send(
    SayHello("Tom".into())
)
.await?;
```

---

## 处理消息

```rust
impl Handler<SayHello> for Printer
```

---

## 停止

```rust
drop(addr);
```

或者：

```rust
ctx.stop_self();
```

---

# 对照 Tokio

Tokio 写法：

```rust
enum Cmd {
    Set(String),
    Get,
}
```

```rust
let (tx, rx) =
    mpsc::channel(32);
```

```rust
while let Some(cmd) =
    rx.recv().await
{
    match cmd {
        ...
    }
}
```

---

Xtra 写法：

```rust
struct Set(String);

struct Get;
```

```rust
Address<MyActor>
```

```rust
impl Handler<Set>
```

```rust
impl Handler<Get>
```

---

# 关系映射

| Tokio      | Xtra        |
| ---------- | ----------- |
| Service    | Actor       |
| State      | Actor字段     |
| Cmd        | Message     |
| Sender     | Address     |
| Receiver   | Mailbox     |
| match Cmd  | Handler     |
| spawn task | spawn_actor |

---

# 推荐模式

## Actor 自己负责启动

```rust
impl Printer {
    pub fn start() -> Address<Self> {

        let (addr, mailbox) =
            Mailbox::bounded(32);

        xtra::spawn_tokio(
            Self {
                times: 0,
            },
            (addr.clone(), mailbox),
        );

        addr
    }
}
```

使用：

```rust
let printer =
    Printer::start();
```

---

# Tauri 推荐结构

启动时创建一次：

```rust
let printer =
    Printer::start();

tauri::Builder::default()
    .manage(printer)
```

Command：

```rust
#[tauri::command]
pub async fn hello(
    name: String,
    printer: State<'_, Address<Printer>>,
) -> Result<(), String> {

    printer
        .send(
            SayHello(name)
        )
        .await
        .map_err(|e| e.to_string())
}
```

---

# 最重要的记忆

```text
Actor = 有状态的 Service

Message = Cmd

Address = Sender

Handler = match Cmd

Mailbox = 消息队列
```

如果记住这五句话，已经掌握 Xtra 80% 的内容。
