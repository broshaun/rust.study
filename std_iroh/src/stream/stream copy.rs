use anyhow::{anyhow, Context, Result};
use iroh::endpoint::{presets, Endpoint};
use iroh_tickets::endpoint::EndpointTicket;
use tokio::sync::{mpsc, Mutex};

const ALPN: &[u8] = b"/zoey/chat/1";
const CHANNEL_SIZE: usize = 64;

pub struct BiStreamSession {
    tx: mpsc::Sender<Vec<u8>>,
    rx: mpsc::Receiver<Vec<u8>>,
}

impl BiStreamSession {
    pub fn new(tx: mpsc::Sender<Vec<u8>>, rx: mpsc::Receiver<Vec<u8>>) -> Self {
        Self { tx, rx }
    }

    pub async fn send(&self, data: Vec<u8>) -> Result<()> {
        self.tx
            .send(data)
            .await
            .map_err(|_| anyhow!("Failed to send: Receiver dropped"))
    }

    pub async fn recv(&mut self) -> Option<Vec<u8>> {
        self.rx.recv().await
    }

    pub fn sender(&self) -> mpsc::Sender<Vec<u8>> {
        self.tx.clone()
    }
}

pub struct Node {
    endpoint: Endpoint,
    session: Mutex<Option<BiStreamSession>>,
}

impl Node {
    pub async fn new() -> Result<Self> {
        let endpoint = Endpoint::builder(presets::N0)
            .alpns(vec![ALPN.to_vec()])
            .bind()
            .await?;

        endpoint.online().await;

        Ok(Self {
            endpoint,
            session: Mutex::new(None),
        })
    }
    /// 主动清空当前 session
    pub async fn close_session(&self) {
        self.session.lock().await.take();
    }


    pub async fn close(&self) {
        // 先丢掉当前会话
        self.session.lock().await.take();

        // 再关闭 endpoint
        self.endpoint.close().await;
    }

    pub fn is_online(&self) -> bool {
        !self.endpoint.is_closed()
    }

    pub fn get_ticket(&self) -> String {
        let addr = self.endpoint.addr();
        let ticket = EndpointTicket::new(addr);
        format!("{}", ticket)
    }

    pub fn print_info(&self) {
        let addr = self.endpoint.addr();
        let ticket = EndpointTicket::new(addr);
        println!("🚀 节点已启动");
        println!("节点信息:\n{:#?}", ticket);
    }

    /// 服务端：等待连接并保存 session
    pub async fn start_accept(&self) -> Result<()> {
        let incoming = self
            .endpoint
            .accept()
            .await
            .ok_or_else(|| anyhow!("Endpoint closed"))?;

        let conn = incoming.await.context("Connection establishment failed")?;
        let (send, recv) = conn
            .accept_bi()
            .await
            .context("Failed to accept bi-stream")?;

        let session = self.handle_io_loop(send, recv);
        *self.session.lock().await = Some(session);

        Ok(())
    }

    /// 客户端：连接远端并保存 session
    pub async fn start_connect(&self, ticket_str: String) -> Result<()> {
        let ticket: EndpointTicket = ticket_str
            .parse()
            .map_err(|e| anyhow!("解析失败: {}", e))?;

        let conn = self
            .endpoint
            .connect(ticket, ALPN)
            .await
            .context("Failed to connect to peer")?;

        let (mut send, recv) = conn.open_bi().await.context("Failed to open bi-stream")?;

        // 激活 bi-stream
        send.write_all(b"HELO")
            .await
            .context("Failed to send handshake")?;

        let session = self.handle_io_loop(send, recv);
        *self.session.lock().await = Some(session);

        Ok(())
    }

    /// 对当前 session 发送数据
    pub async fn send(&self, data: Vec<u8>) -> Result<()> {
        let guard = self.session.lock().await;
        let session = guard
            .as_ref()
            .ok_or_else(|| anyhow!("No active session"))?;

        session.send(data).await
    }

    /// 从当前 session 接收数据
    pub async fn recv(&self) -> Result<Option<Vec<u8>>> {
        let mut guard = self.session.lock().await;
        let session = guard
            .as_mut()
            .ok_or_else(|| anyhow!("No active session"))?;

        Ok(session.recv().await)
    }


    fn handle_io_loop(
        &self,
        mut quic_send: iroh::endpoint::SendStream,
        mut quic_recv: iroh::endpoint::RecvStream,
    ) -> BiStreamSession {
        let (outgoing_tx, mut outgoing_rx) = mpsc::channel::<Vec<u8>>(CHANNEL_SIZE);
        let (incoming_tx, incoming_rx) = mpsc::channel::<Vec<u8>>(CHANNEL_SIZE);

        // 网络 -> 内存
        tokio::spawn(async move {
            let mut buf = vec![0u8; 8192];

            loop {
                match quic_recv.read(&mut buf).await {
                    Ok(Some(n)) if n > 0 => {
                        if incoming_tx.send(buf[..n].to_vec()).await.is_err() {
                            break;
                        }
                    }
                    Ok(None) => break,
                    Err(e) => {
                        eprintln!("🔴 [IO Read Error]: {e}");
                        break;
                    }
                    _ => {}
                }
            }
        });

        // 内存 -> 网络
        tokio::spawn(async move {
            while let Some(data) = outgoing_rx.recv().await {
                if let Err(e) = quic_send.write_all(&data).await {
                    eprintln!("🔴 [IO Write Error]: {e}");
                    break;
                }
            }

            let _ = quic_send.finish();
        });

        BiStreamSession::new(outgoing_tx, incoming_rx)
    }
}