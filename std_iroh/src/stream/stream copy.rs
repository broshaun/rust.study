use anyhow::{Context, Result, anyhow};
use iroh::endpoint::{Endpoint, presets};
use iroh_tickets::endpoint::EndpointTicket;
use std::sync::{Arc,atomic::{Ordering,AtomicBool}};

const ALPN: &[u8] = b"/zoey/chat/1";

#[derive(Clone, Debug)]
enum ChannelMessage {
    Data(Vec<u8>),
    Stop, 
}

#[derive(Clone, Debug)]
pub struct P2PChannel {
    // 内存 -> 网络 (Flume -> Iroh)
    outgoing_tx: flume::Sender<ChannelMessage>,
    outgoing_rx: flume::Receiver<ChannelMessage>,
    // 网络 -> 内存 (Iroh -> Flume)
    incoming_rx: flume::Receiver<ChannelMessage>,
    incoming_tx: flume::Sender<ChannelMessage>,
    // 通达状态
    is_active: Arc<AtomicBool>,
}

impl P2PChannel {
    fn new() -> Self {
        let (outgoing_tx, outgoing_rx) = flume::unbounded::<ChannelMessage>();
        let (incoming_tx, incoming_rx) = flume::unbounded::<ChannelMessage>();
        P2PChannel {
            outgoing_tx,
            outgoing_rx,
            incoming_tx,
            incoming_rx,

            is_active: Arc::new(AtomicBool::new(true))
        }
    }

    /// 彻底关闭通道
    fn close(&self) {
        self.is_active.store(false, Ordering::SeqCst);
    }

    async fn send(&self, data: Vec<u8>) -> Result<bool> {
        let active_flag = self.is_active.clone();

        if active_flag.load(Ordering::Relaxed){
            let msg = ChannelMessage::Data(data);
            self.outgoing_tx.send_async(msg).await.context("发送失败")?;
            return Ok(true);
        };

        Ok(false)
    }

    async fn recv(&self) -> Result<Vec<u8>> {
        let msg: ChannelMessage = self.incoming_rx.recv_async().await.context("接收失败")?;
        match msg {
            ChannelMessage::Data(data)=>{
                return Ok(data);
            },
            ChannelMessage::Stop=>{
                self.close();
                return Err(anyhow!("未能接收信息"));
            }
        }
    }

    fn bind_io_loop(
        &self,
        mut quic_send: iroh::endpoint::SendStream,
        mut quic_recv: iroh::endpoint::RecvStream,
    ) -> Result<tokio::task::JoinHandle<Result<(), anyhow::Error>>> {
        let mut set = tokio::task::JoinSet::<Result<()>>::new();

        // 任务 A: 网络 -> 内存 (Iroh -> Flume)
        let tx = self.incoming_tx.clone();
        let active_flag = self.is_active.clone();

        set.spawn(async move {
            let mut buf = vec![0u8; 8192];
            while active_flag.load(Ordering::Relaxed) {
                let result = quic_recv.read(&mut buf).await?;
                match result {
                    Some(n) => {
                        let data = buf[..n].to_vec();
                        tx.send_async(ChannelMessage::Data(data)).await?;
                    }
                    None => {
                        tx.send_async(ChannelMessage::Stop).await?;
                        active_flag.store(false, Ordering::SeqCst);
                        break;
                    }
                }
            }
            return Ok(());
        });

        // 任务 B: 内存 -> 网络 (Flume -> Iroh)
        let rx = self.outgoing_rx.clone();
        set.spawn(async move {
            while let Ok(msg) = rx.recv_async().await {
                match msg {
                    ChannelMessage::Data(data) => {
                        quic_send.write_all(&data).await?;
                    }
                    ChannelMessage::Stop => {
                        break
                    }
                }
            }
            quic_send.finish()?;
            return Ok(());
        });

        let active_flag = self.is_active.clone();
        let handle: tokio::task::JoinHandle<Result<(), anyhow::Error>> = tokio::spawn(async move {
            while let Some(res) = set.join_next().await {
                // 捕获错误，不崩溃
                match res? {
                    Ok(()) => {}
                    Err(e) => {
                        active_flag.store(false, Ordering::SeqCst);
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

    pub async fn recv(&self)-> Result<Vec<u8>> {
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
        send.write_all(b"HELO").await.context("Failed to send handshake")?;
        let _ = self.message.bind_io_loop(send, recv)?;
        Ok(())
    }

    pub async fn close(&self) {
        self.endpoint.close().await;
        self.message.close();
    }

    pub fn is_online(&self) -> bool {
        !self.endpoint.is_closed()
    }

    pub fn get_ticket(&self) -> String {
        EndpointTicket::new(self.endpoint.addr()).to_string()
    }

    pub fn get_info(&self) -> String {
        format!("{:#?}", EndpointTicket::new(self.endpoint.addr()))
    }

    pub fn print_info(&self) {
        println!("🚀 节点已启动");
        println!(
            "🎫 节点信息:\n{:#?}",
            EndpointTicket::new(self.endpoint.addr())
        );
    }
}
