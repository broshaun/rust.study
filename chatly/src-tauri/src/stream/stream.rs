use anyhow::{anyhow, Context, Result};
use iroh::endpoint::{presets, Endpoint};
use iroh_tickets::endpoint::EndpointTicket;
use std::sync::{Arc};
use tokio::sync::{mpsc, oneshot, RwLock};
use tokio_util::sync::CancellationToken;
use tokio_util::task::TaskTracker;

const ALPN: &[u8] = b"/zoey/chat/1";

pub enum Cmd {
    Accept {
        reply: oneshot::Sender<P2PNode>,
    },
    Connect {
        ticket: String,
        reply: oneshot::Sender<P2PNode>,
    },
    Get {
        reply: oneshot::Sender<P2PNode>,
    },
}

#[derive(Clone, Debug)]
pub struct Task {
    pub task: TaskTracker,
    pub token: CancellationToken,
}

impl Task {
    pub fn new() -> Self {
        let task = TaskTracker::new();
        let token = CancellationToken::new();
        Self { task, token }
    }

    pub async fn stop(&self) {
        self.token.cancel();
        self.task.close();
        // self.task.wait().await;
    }

    pub fn info(&self) -> String {
        let closed = self.task.is_closed();
        let cancelled = self.token.is_cancelled();
        format!(
            "task closed is {} token cancelled is {} ",
            closed, cancelled
        )
    }

    pub async fn manage(&self, mut rx: mpsc::Receiver<Cmd>) {
        let task = self.task.clone();
        let token = self.token.clone();

        self.task.spawn(async move {
            let res = P2PNode::new().await;

            while let Ok(ref node) = res {
                tokio::select! {
                    _ = token.cancelled() => {
                        node.stop().await;
                        break;
                    },
                    Some(cmd) = rx.recv() => {
                        match cmd {
                            Cmd::Accept { reply } => {
                                let node2 = node.clone();
                                task.spawn(async move{
                                    if let Err(e) = node2.start_accept().await {
                                        eprintln!("start_accept error: {:?}", e);
                                    }
                                });
                                let _ = reply.send(node.clone());
                            },
                            Cmd::Connect { ticket, reply } => {
                                let node2 = node.clone();
                                task.spawn(async move{
                                    if let Err(e) = node2.start_connect(&ticket).await {
                                        eprintln!("start_connect error: {:?}", e);
                                    }
                                });
                                let _ = reply.send(node.clone());
                            },
                            Cmd::Get { reply } =>{
                                let node = node.clone();
                                if let Err(e) = reply.send(node) {
                                    eprintln!("start_connect error: {:?}", e);
                                };

                            },
                        }
                    },
                }
            }
        });
    }
}

#[derive(Clone, Debug)]
pub enum P2PState {
    Idle,        // 空闲
    Calling,     // 呼叫
    Connected,   // 连通
    Disconnected // 断开
}

#[derive(Clone, Debug)]
pub struct P2PChannel {
    // 内存 -> 网络 (Flume -> Iroh)
    outgoing_tx: flume::Sender<Vec<u8>>,
    outgoing_rx: flume::Receiver<Vec<u8>>,
    // 网络 -> 内存 (Iroh -> Flume)
    incoming_rx: flume::Receiver<Vec<u8>>,
    incoming_tx: flume::Sender<Vec<u8>>,
    token: CancellationToken,
}

impl P2PChannel {
    fn new() -> Self {
        let (outgoing_tx, outgoing_rx) = flume::bounded::<Vec<u8>>(10);
        let (incoming_tx, incoming_rx) = flume::bounded::<Vec<u8>>(10);
        let token = CancellationToken::new();
        P2PChannel {
            outgoing_tx,
            outgoing_rx,
            incoming_tx,
            incoming_rx,
            token,
        }
    }

    fn stop(&self) {
        self.token.cancel();
    }

    async fn send(&self, data: Vec<u8>) -> Result<()> {
        if self.token.is_cancelled() {
            return Err(anyhow!("未打开通道"));
        }
        self.outgoing_tx.send_async(data).await?;
        return Ok(());
    }

    async fn recv(&self) -> Option<Vec<u8>> {
        if self.token.is_cancelled() {
            return None;
        }
        let rx = self.incoming_rx.clone();
        let Ok(msg) = rx.recv_async().await else {
            return None;
        };
        return Some(msg);
    }

    async fn bind_io_loop(
        &self,
        mut quic_send: iroh::endpoint::SendStream,
        mut quic_recv: iroh::endpoint::RecvStream,
    ) -> Result<()> {
        let task = TaskTracker::new();
        // 任务 A: 网络 -> 内存 (Iroh -> Flume)
        let atoken = self.token.clone();
        let tx = self.incoming_tx.clone();

        // 任务 A: 网络 -> 内存 (Iroh -> Flume)
        task.spawn(async move {
            let mut buf = vec![0u8; 8192];
            loop {
                tokio::select! {
                    _ = atoken.cancelled() => {
                        break;
                    },
                    res = quic_recv.read(&mut buf) => {
                        match res.unwrap() {
                            Some(n) => {
                                let data = buf[..n].to_vec();
                                tx.send_async(data).await.unwrap();
                            }
                            None => {
                                break;
                            }
                        }
                    },
                }
            }
        });

        // 任务 B: 内存 -> 网络 (Flume -> Iroh)
        let rx = self.outgoing_rx.clone();
        let atoken = self.token.clone();
        task.spawn(async move {
            loop {
                tokio::select! {
                    _ = atoken.cancelled() => {
                        break;
                    },
                    Ok(msg) = rx.recv_async() => {
                        quic_send.write_all(&msg).await.unwrap();
                    },
                }
            }
            quic_send.finish().unwrap();
        });
        task.close();
        task.wait().await;
        Ok(())
    }
}

#[derive(Clone,Debug)]
pub struct P2PNode {
    pub endpoint: Endpoint,
    pub channel: P2PChannel,
    pub state: Arc<RwLock<P2PState>>,
}

impl P2PNode {
    pub async fn new() -> Result<Self> {
        let endpoint = Endpoint::builder(presets::N0)
            .alpns(vec![ALPN.to_vec()])
            .bind()
            .await?;

        endpoint.online().await;

        Ok(Self {
            endpoint: endpoint,
            channel: P2PChannel::new(),
            state: Arc::new(RwLock::new(P2PState::Idle)),
        })
    }

    pub async fn stop(&self) {
        self.channel.stop();
        self.endpoint.close().await;
    }

    pub async fn send(&self, data: Vec<u8>) -> Result<()> {
        match *self.state.read().await {
            P2PState::Idle =>{
                return Err(anyhow!("未呼叫通话"));
            },
            P2PState::Calling => {
                return Err(anyhow!("通话未接通"));
            },
            P2PState::Connected => {
                return self.channel.send(data).await;
            },
            P2PState::Disconnected => {
                return Err(anyhow!("通话已结束"));
            },
        }
    }

    pub async fn recv(&self) -> Option<Vec<u8>> {
        return self.channel.recv().await;
    }
    /**
     * 内部发送信息处理
     */
    pub async fn start_accept(&self) -> Result<()> {
        match *self.state.read().await {
            P2PState::Idle =>{},
            P2PState::Calling => {
                return Err(anyhow!("重复通话"));
            },
            P2PState::Connected => {
                return Err(anyhow!("无法多个通话"));
            },
            P2PState::Disconnected => {
                return Err(anyhow!("通话已结束"));
            },
        }
        *self.state.write().await = P2PState::Calling;
        let endpoint = self.endpoint.clone();
        let incoming = endpoint.accept().await.context("未能打开accept")?;
        let conn = incoming.await?;
        let (send, recv) = conn.accept_bi().await.context("123")?;
        *self.state.write().await = P2PState::Connected;
        let _a = self.channel.bind_io_loop(send, recv).await?;
        *self.state.write().await = P2PState::Disconnected;
        Ok(())
    }

    pub async fn start_connect(&self, ticket_str: &str) -> Result<()> {
        match *self.state.read().await {
            P2PState::Idle =>{},
            P2PState::Calling => {
                return Err(anyhow!("重复通话"));
            },
            P2PState::Connected => {
                return Err(anyhow!("无法多个通话"));
            },
            P2PState::Disconnected => {
                return Err(anyhow!("通话已结束"));
            },
        }
        *self.state.write().await = P2PState::Calling;
        let endpoint = self.endpoint.clone();
        let ticket: EndpointTicket = ticket_str.parse().context("解析失败")?;
        let conn: iroh::endpoint::Connection = endpoint.connect(ticket, ALPN).await?;
        let (mut send, recv) = conn.open_bi().await?;
        send.write_all(b"HELO")
            .await
            .context("Failed to send handshake")?;
        *self.state.write().await = P2PState::Connected;
        let _a = self.channel.bind_io_loop(send, recv).await?;
        *self.state.write().await = P2PState::Disconnected;
        Ok(())
    }

    /**
     * 连接凭证
     */
    pub fn get_ticket(&self) -> String {
        EndpointTicket::new(self.endpoint.addr()).to_string()
    }
    /**
     * 节点信息
     */
    pub fn get_info(&self) -> String {
        format!("{:#?}", EndpointTicket::new(self.endpoint.addr()))
    }
}
