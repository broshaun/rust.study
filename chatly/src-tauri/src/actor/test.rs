use xtra::prelude::*;

#[derive(Default, xtra::Actor)]
struct Printer {
    times: usize,
}

struct Print(String);

impl Handler<Print> for Printer {
    type Return = ();

    async fn handle(&mut self, msg: Print, _ctx: &mut Context<Self>) {
        self.times += 1;
        println!("打印: {}，已打印 {} 次", msg.0, self.times);
    }
}

#[tauri::command]
pub async fn test() -> Result<(), String> {
    println!("创建 Actor");

    let (addr, mailbox) = Mailbox::bounded(32);

    xtra::spawn_tokio(
        Printer::default(),
        (addr.clone(), mailbox),
    );

    println!("发送消息");

    addr.send(Print("hello".to_string()))
        .await
        .map_err(|e| e.to_string())?;

    println!("结束");

    Ok(())
}