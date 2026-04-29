use anyhow::{Context, Result, anyhow};
use iroh::endpoint::{Endpoint, presets};
use iroh_tickets::endpoint::EndpointTicket;
use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
};
use tokio::sync::{
    Mutex,
    mpsc::{Receiver, Sender, channel},
    watch,
};
use tokio::time::{sleep, Duration};

const ALPN: &[u8] = b"/zoey/chat/1";

#[derive(Clone, Debug)]
enum ChannelMessage {
    Data(Vec<u8>),
    Stop,
}

#[derive(Clone, Debug)]
pub struct P2PChannel {
    // 内存 -> 网络 (Flume -> Iroh)
    outgoing_tx: Sender<ChannelMessage>,
    outgoing_rx: Arc<Mutex<Receiver<ChannelMessage>>>,
    // 网络 -> 内存 (Iroh -> Flume)
    incoming_rx: Arc<Mutex<Receiver<ChannelMessage>>>,
    incoming_tx: Sender<ChannelMessage>,
    // 通道状态
    is_active: Arc<AtomicBool>,
}

impl P2PChannel {
    fn new() -> Self {
        let (outgoing_tx, outgoing_rx) = channel::<ChannelMessage>(10);
        let (incoming_tx, incoming_rx) = channel::<ChannelMessage>(10);
        P2PChannel {
            outgoing_tx,
            outgoing_rx: Arc::new(Mutex::new(outgoing_rx)),
            incoming_tx,
            incoming_rx: Arc::new(Mutex::new(incoming_rx)),
            is_active: Arc::new(AtomicBool::new(true)),
        }
    }

    /**
     * 彻底关闭通道
     */
    async fn stop(&self) -> Result<()> {
        if self.is_active.load(Ordering::Relaxed) {
            let msg = ChannelMessage::Stop;
            self.outgoing_tx.send(msg).await?;
        };
        Ok(())
    }

    async fn send(&self, data: Vec<u8>) -> Result<bool> {
        if self.is_active.load(Ordering::Relaxed) {
            let msg = ChannelMessage::Data(data);
            self.outgoing_tx.send(msg).await?;
            return Ok(true);
        }
        Ok(false)
    }

    async fn recv(&self) -> Option<Vec<u8>> {
        let a = self.incoming_rx.clone();
        let mut b = a.lock().await;
        let Some(msg) = b.recv().await else{
            return None
        };
        match msg {
            ChannelMessage::Data(data) => {
                return Some(data);
            }
            ChannelMessage::Stop => {
                // self.is_active.store(false, Ordering::SeqCst);
                return None
            }
        };
    }

    fn bind_io_loop(
        &self,
        mut quic_send: iroh::endpoint::SendStream,
        mut quic_recv: iroh::endpoint::RecvStream,
    ) -> Result<tokio::task::JoinHandle<Result<()>>> {
        let mut set = tokio::task::JoinSet::<Result<()>>::new();
        let (stop_tx, stop_rx) = watch::channel(false);

        // 任务 A: 网络 -> 内存 (Iroh -> Flume)
        let mut rx_a = stop_rx.clone();
        let active_flag = self.is_active.clone();
        let tx = self.incoming_tx.clone();
        set.spawn(async move {
            let mut buf = vec![0u8; 8192];

            while active_flag.load(Ordering::Relaxed) {
                tokio::select! {
                    _ = rx_a.changed() => {
                        if *rx_a.borrow() {
                            break;
                        }
                    },
                    res = quic_recv.read(&mut buf) => {
                        match res? {
                            Some(n) => {
                                let data = buf[..n].to_vec();
                                tx.send(ChannelMessage::Data(data)).await?;
                            }
                            None => {
                                tx.send(ChannelMessage::Stop).await?;
                                break;
                            }
                        }
                    },
                    // _ = sleep(Duration::from_secs(30)) => {
                    //     println!("Timeout reached: 30 seconds passed.");
                    //     break
                    // }
                }
            }
            return Ok(());
        });

        // 任务 B: 内存 -> 网络 (Flume -> Iroh)
        let rx = self.outgoing_rx.clone();
        let mut rx_a = stop_rx.clone();
        let active_flag = self.is_active.clone();
        set.spawn(async move {
            let mut a = rx.lock().await;

            while active_flag.load(Ordering::Relaxed) {
                tokio::select! {
                    _ = rx_a.changed() => {
                        if *rx_a.borrow() {
                            break;
                        }
                    },
                    Some(msg) = a.recv() => {
                        match msg {
                            ChannelMessage::Data(data) => {
                                quic_send.write_all(&data).await?;
                            }
                            ChannelMessage::Stop => break,
                        }
                    },
                    // _ = sleep(Duration::from_secs(30)) => {
                    //     println!("Timeout reached: 30 seconds passed.");
                    //     break
                    // }
                }
            }
            quic_send.finish()?;
            return Ok(());
        });

        let active_flag = self.is_active.clone();
        let tx_a = stop_tx.clone();
        let handle: tokio::task::JoinHandle<Result<()>> = tokio::spawn(async move {
            while let Some(res) = set.join_next().await {
                active_flag.store(false, Ordering::SeqCst);
                match res? {
                    Ok(()) => {
                        tx_a.send(false)?;
                    }
                    Err(e) => {
                        set.abort_all();
                        return Err(anyhow!(e));
                    }
                }
            }
            Ok(())
        });
        Ok(handle)
    }
}

#[derive(Clone, Debug)]
pub struct P2PNode {
    pub endpoint: Arc<Endpoint>,
    pub message: P2PChannel,
}

impl P2PNode {
    pub async fn new() -> Result<Self> {
        let endpoint = Endpoint::builder(presets::N0)
            .alpns(vec![ALPN.to_vec()])
            .bind()
            .await?;
        endpoint.online().await;

        Ok(Self {
            endpoint: Arc::new(endpoint),
            message: P2PChannel::new(),
        })
    }

    pub async fn send(&self, data: Vec<u8>) -> Result<bool> {
        return self.message.send(data).await;
    }

    pub async fn recv(&self) -> Option<Vec<u8>> {
        return self.message.recv().await;
    }

    /**
     * 内部发送信息处理
     */
    pub async fn start_accept(&self) -> Result<()> {
        let endpoint = self.endpoint.clone();
        let incoming = endpoint.accept().await.context("未能打开accept")?;
        let conn = incoming.await?;
        let (send, recv) = conn.accept_bi().await.context("123")?;
        let _ = self.message.bind_io_loop(send, recv)?;
        Ok(())
    }

    pub async fn start_connect(&self, ticket_str: &str) -> Result<()> {
        let endpoint = self.endpoint.clone();
        let ticket: EndpointTicket = ticket_str.parse().context("解析失败")?;
        let conn: iroh::endpoint::Connection = endpoint.connect(ticket, ALPN).await?;
        let (mut send, recv) = conn.open_bi().await?;
        send.write_all(b"HELO")
            .await
            .context("Failed to send handshake")?;
        let _ = self.message.bind_io_loop(send, recv)?;
        Ok(())
    }

    pub async fn close(&self) {
        self.endpoint.close().await;
        let _ = self.message.stop().await;
    }

    pub fn is_online(&self) -> bool {
        !self.endpoint.is_closed()
    }

    pub fn is_channel(&self) -> bool {
        self.message.is_active.load(Ordering::SeqCst)
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
