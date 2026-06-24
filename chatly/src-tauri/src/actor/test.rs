use std::sync::OnceLock;
use xtra::prelude::*;

#[derive(Default, xtra::Actor)]
pub struct Printer {
    times: usize,
}
impl Printer {
    pub(super) fn start() -> Address<Self> {
        let (addr, mailbox) = Mailbox::bounded(32);
        xtra::spawn_tokio(Self { times: 0 }, (addr.clone(), mailbox));
        addr
    }
}

static GLOBAL_ACTOR: OnceLock<Address<Printer>> = OnceLock::new();

pub(super) struct SayHello(pub String);
impl Handler<SayHello> for Printer {
    type Return = ();
    async fn handle(&mut self, msg: SayHello, _ctx: &mut Context<Self>) {
        self.times += 1;
        println!("Hello {}, 第 {} 次调用", msg.0, self.times);
    }
}

#[tauri::command]
pub async fn test(name: String) -> Result<(), String> {
    println!("创建 Actor");
    let addr = GLOBAL_ACTOR.get_or_init(|| Printer::start());

    println!("发送消息");
    addr.send(SayHello(name)).await.map_err(|e| e.to_string())?;

    println!("结束");
    Ok(())
}