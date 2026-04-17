use anyhow::{Context, Result, anyhow};
use flume::{Receiver, Sender};
use iroh::endpoint::{Endpoint, presets};
use iroh_tickets::endpoint::EndpointTicket;

const ALPN: &[u8] = b"/zoey/chat/1";

struct BiChannel {
    tx: Sender<Vec<u8>>,
    rx: Receiver<Vec<u8>>,
}

pub struct Node {
    endpoint: Endpoint,
    bichannel: Option<BiChannel>,
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
            bichannel: None,
        })
    }

    /// 关闭整个节点
    pub async fn close(&self) {
        // self.close_session();
        self.endpoint.close().await;
    }

    pub fn is_online(&self) -> bool {
        !self.endpoint.is_closed()
    }

    pub fn get_ticket(&self) -> String {
        EndpointTicket::new(self.endpoint.addr()).to_string()
    }

    pub fn print_info(&self) {
        println!("🚀 节点已启动");
        println!(
            "🎫 节点信息:\n{:#?}",
            EndpointTicket::new(self.endpoint.addr())
        );
    }

    /// 【服务端】等待连接
    pub async fn start_accept(&mut self) -> Result<()> {
        let incoming = self.endpoint.accept().await.context("未能打开accept")?;
        let conn = incoming.await.context("Connection establishment failed")?;
        let (send, recv) = conn
            .accept_bi()
            .await
            .context("Failed to accept bi-stream")?;
        self.bind_io_loop(send, recv).await?;
        Ok(())
    }

    /// 【客户端】连接远端
    pub async fn start_connect(&mut self, ticket_str: &str) -> Result<()> {
        let ticket: EndpointTicket = ticket_str.parse().context("解析失败")?;
        let conn = self.endpoint.connect(ticket, ALPN).await?;
        let (mut send, recv) = conn.open_bi().await?;
        send.write_all(b"HELO")
            .await
            .context("Failed to send handshake")?;
        self.bind_io_loop(send, recv).await?;
        Ok(())
    }

    /// 发送数据：利用 Flume 的异步发送
    pub async fn send(&self, data: Vec<u8>) -> Result<()> {
        let Some(ch) = self.bichannel.as_ref() else {
            return Err(anyhow!("通道未开启"));
        };
        let tx = ch.tx.clone();
        tx.send_async(data).await.context("发送失败")?;
        Ok(())
    }

    /// 接收数据：利用 Flume 的异步接收
    pub async fn recv(&self) -> Result<Vec<u8>> {
        let Some(ch) = self.bichannel.as_ref() else {
            return Err(anyhow!("通道未开启"));
        };
        let rx = ch.rx.clone();
        let data = rx.recv_async().await.context("接收失败")?;
        Ok(data)
    }

    /// 内部私ive方法：处理网络流转换
    async fn bind_io_loop(
        &mut self,
        mut quic_send: iroh::endpoint::SendStream,
        mut quic_recv: iroh::endpoint::RecvStream,
    ) -> Result<()> {
        let (outgoing_tx, outgoing_rx) = flume::unbounded::<Vec<u8>>();
        let (incoming_tx, incoming_rx) = flume::unbounded::<Vec<u8>>();

        self.bichannel = Some(BiChannel {
            tx: outgoing_tx,
            rx: incoming_rx,
        });

        // 任务 A: 网络 -> 内存 (Iroh -> Flume)
        tokio::spawn(async move {
            let mut buf = vec![0u8; 8192];
            loop {
                match quic_recv.read(&mut buf).await {
                    Ok(Some(n)) => {
                        if let Err(e) = incoming_tx.send_async(buf[..n].to_vec()).await {
                            eprintln!("🔴 [通道发送失败]: {e}");
                            break;
                        }
                    }
                    Ok(None) => break,
                    Err(_) => break,
                }
            }
        });

        // 任务 B: 内存 -> 网络 (Flume -> Iroh)
        tokio::spawn(async move {
            while let Ok(data) = outgoing_rx.recv_async().await {
                if let Err(_) = quic_send.write_all(&data).await {
                    break;
                }
            }
            let _ = quic_send.finish();
        });

        Ok(())
    }
}
