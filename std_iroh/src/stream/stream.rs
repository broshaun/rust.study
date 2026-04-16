use anyhow::{anyhow, Context, Result};
use iroh::endpoint::{presets, Endpoint};
use iroh_tickets::endpoint::EndpointTicket;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex, RwLock};

const ALPN: &[u8] = b"/zoey/chat/1";
const CHANNEL_SIZE: usize = 64;

/// 优雅的 Node 结构：彻底解耦了发送与接收，并支持任意 Clone
#[derive(Clone)]
pub struct Node {
    endpoint: Endpoint,
    // 读写分离存放：
    // tx 使用 RwLock，发送时只需短暂拿读锁 clone 出一份 Sender 即可，毫不阻塞
    tx: Arc<RwLock<Option<mpsc::Sender<Vec<u8>>>>>,
    // rx 必须独占接收，使用 Mutex
    rx: Arc<Mutex<Option<mpsc::Receiver<Vec<u8>>>>>,
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
            tx: Arc::new(RwLock::new(None)),
            rx: Arc::new(Mutex::new(None)),
        })
    }

    /// 主动清空当前 session（利用 Rust 机制，通道释放后后台任务会自动退出）
    pub async fn close_session(&self) {
        self.tx.write().await.take();
        self.rx.lock().await.take();
    }

    /// 关闭整个节点
    pub async fn close(&self) {
        self.close_session().await;
        let _ = self.endpoint.close().await;
    }

    pub fn is_online(&self) -> bool {
        !self.endpoint.is_closed()
    }

    pub fn get_ticket(&self) -> String {
        EndpointTicket::new(self.endpoint.addr()).to_string()
    }

    pub fn print_info(&self) {
        println!("🚀 节点已启动");
        println!("🎫 节点信息:\n{:#?}", EndpointTicket::new(self.endpoint.addr()));
    }

    /// 【服务端】等待连接
    pub async fn start_accept(&self) -> Result<()> {
        let incoming = self.endpoint.accept().await.ok_or_else(|| anyhow!("Endpoint closed"))?;
        let conn = incoming.await.context("Connection establishment failed")?;
        let (send, recv) = conn.accept_bi().await.context("Failed to accept bi-stream")?;

        self.bind_io_loop(send, recv).await;
        Ok(())
    }

    /// 【客户端】连接远端
    pub async fn start_connect(&self, ticket_str: &str) -> Result<()> {
        let ticket: EndpointTicket = ticket_str.parse().map_err(|e| anyhow!("解析失败: {e}"))?;
        
        let conn = self.endpoint.connect(ticket, ALPN).await
            .context("Failed to connect to peer")?;

        let (mut send, recv) = conn.open_bi().await.context("Failed to open bi-stream")?;

        // 发送握手信号
        send.write_all(b"HELO").await.context("Failed to send handshake")?;

        self.bind_io_loop(send, recv).await;
        Ok(())
    }

    /// 发送数据：极速非阻塞设计
    pub async fn send(&self, data: Vec<u8>) -> Result<()> {
        // 只需瞬间获取读锁，克隆一个 Sender 出来，立刻释放锁
        let tx = self.tx.read().await.clone(); 
        
        match tx {
            Some(sender) => {
                sender.send(data).await.map_err(|_| anyhow!("会话已断开，发送失败"))?;
                Ok(())
            }
            None => Err(anyhow!("No active session")),
        }
    }

    /// 接收数据：安全的独占接收
    pub async fn recv(&self) -> Result<Option<Vec<u8>>> {
        let mut rx_guard = self.rx.lock().await;
        
        match rx_guard.as_mut() {
            Some(rx) => Ok(rx.recv().await),
            None => Err(anyhow!("No active session")),
        }
    }

    /// 内部私有方法：处理网络流转换并绑定到当前 Node
    async fn bind_io_loop(&self, mut quic_send: iroh::endpoint::SendStream, mut quic_recv: iroh::endpoint::RecvStream) {
        let (outgoing_tx, mut outgoing_rx) = mpsc::channel::<Vec<u8>>(CHANNEL_SIZE);
        let (incoming_tx, incoming_rx) = mpsc::channel::<Vec<u8>>(CHANNEL_SIZE);

        // 更新状态 (先清空旧的连接)
        *self.tx.write().await = Some(outgoing_tx);
        *self.rx.lock().await = Some(incoming_rx);

        // 任务 A: [网络 -> 内存]
        tokio::spawn(async move {
            let mut buf = vec![0u8; 8192];
            loop {
                match quic_recv.read(&mut buf).await {
                    Ok(Some(n)) if n > 0 => {
                        if incoming_tx.send(buf[..n].to_vec()).await.is_err() {
                            break; // 内部不再接收，退出
                        }
                    }
                    Ok(None) => break, // 对端关闭
                    Err(e) => {
                        eprintln!("🔴 [IO Read Error]: {e}");
                        break;
                    }
                    _ => {}
                }
            }
        });

        // 任务 B: [内存 -> 网络]
        tokio::spawn(async move {
            while let Some(data) = outgoing_rx.recv().await {
                if let Err(e) = quic_send.write_all(&data).await {
                    eprintln!("🔴 [IO Write Error]: {e}");
                    break;
                }
            }
            let _ = quic_send.finish(); // 优雅结束
        });
    }
}