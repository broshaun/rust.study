use anyhow::{anyhow, Context, Result};
use iroh::endpoint::{presets, Endpoint};
use iroh_tickets::endpoint::EndpointTicket;
use tokio_util::sync::CancellationToken;


const ALPN: &[u8] = b"/zoey/chat/1";

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

    async fn send(&self, data: Vec<u8>) -> Result<bool> {
        if self.token.is_cancelled() {
            return Err(anyhow!("未打开通道"));
        }
        self.outgoing_tx.send_async(data).await?;
        return Ok(true);
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
        let mut set: tokio::task::JoinSet<Result<()>> = tokio::task::JoinSet::<Result<()>>::new();
        // 任务 A: 网络 -> 内存 (Iroh -> Flume)
        let atoken = self.token.clone();
        let tx = self.incoming_tx.clone();

        // 任务 A: 网络 -> 内存 (Iroh -> Flume)
        set.spawn(async move {
            let mut buf = vec![0u8; 8192];
            loop {
                tokio::select! {
                    _ = atoken.cancelled() => {
                        break;
                    },
                    res = quic_recv.read(&mut buf) => {
                        match res? {
                            Some(n) => {
                                let data = buf[..n].to_vec();
                                tx.send_async(data).await?;
                            }
                            None => {
                                break;
                            }
                        }
                    },
                }
            }
            return Ok(());
        });

        // 任务 B: 内存 -> 网络 (Flume -> Iroh)
        let rx = self.outgoing_rx.clone();
        let atoken = self.token.clone();
        set.spawn(async move {
            loop {
                tokio::select! {
                    _ = atoken.cancelled() => {
                        break;
                    },
                    Ok(msg) = rx.recv_async() => {
                        quic_send.write_all(&msg).await?;
                    },
                }
            }
            quic_send.finish()?;
            return Ok(());
        });

        while let Some(res) = set.join_next().await {
            match res? {
                Ok(()) => {
                    self.token.cancel();
                }
                Err(e) => {
                    set.abort_all();
                    return Err(anyhow!(e));
                }
            }
        }
        Ok(())
    }
}

#[derive(Clone, Debug)]
pub struct P2PNode {
    pub endpoint: Endpoint,
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
            endpoint: endpoint,
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
        let _a = self.message.bind_io_loop(send, recv).await?;
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
        let _a = self.message.bind_io_loop(send, recv).await?;
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
