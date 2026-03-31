use std::{collections::{HashMap, HashSet}, sync::Arc};

use futures::{AsyncReadExt, AsyncWriteExt, StreamExt};
use libp2p::{
    identity,
    multiaddr::Protocol,
    noise,
    swarm::SwarmEvent,
    tcp, yamux,
    Multiaddr, PeerId, Stream, StreamProtocol, Transport,
};
use libp2p_stream as stream;
use tauri::{AppHandle, Emitter};
use tokio::sync::{mpsc, Mutex};

const VOICE_PROTOCOL: &str = "/zoey/voice/1";
const PING_PROTOCOL: &str = "/zoey/ping/1";

#[derive(Default, Clone)]
pub struct ListenAddrs {
    pub quic: Option<Multiaddr>,
    pub tcp: Option<Multiaddr>,
}

enum P2PCommand {
    Dial {
        peer: PeerId,
        addrs: Vec<Multiaddr>,
    },
    Close,
}

pub struct P2PState {
    pub keypair: identity::Keypair,
    pub peer_id: PeerId,
    pub listen_addrs: Arc<Mutex<ListenAddrs>>,
    pub app: Arc<Mutex<Option<AppHandle>>>,
    pub started: Arc<Mutex<bool>>,
    pub cmd_tx: Arc<Mutex<Option<mpsc::UnboundedSender<P2PCommand>>>>,
    pub stream_control: Arc<Mutex<Option<stream::Control>>>,
    pub peer_writers: Arc<Mutex<HashMap<PeerId, mpsc::UnboundedSender<Vec<u8>>>>>,
}

impl Default for P2PState {
    fn default() -> Self {
        let keypair = identity::Keypair::generate_ed25519();
        let peer_id = PeerId::from(keypair.public());

        Self {
            keypair,
            peer_id,
            listen_addrs: Arc::new(Mutex::new(ListenAddrs::default())),
            app: Arc::new(Mutex::new(None)),
            started: Arc::new(Mutex::new(false)),
            cmd_tx: Arc::new(Mutex::new(None)),
            stream_control: Arc::new(Mutex::new(None)),
            peer_writers: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl P2PState {
    pub async fn init(&self, app: AppHandle) -> Result<(), String> {
        {
            let started = self.started.lock().await;
            if *started {
                return Ok(());
            }
        }

        {
            let mut app_guard = self.app.lock().await;
            *app_guard = Some(app);
        }

        let mut swarm = libp2p::SwarmBuilder::with_existing_identity(self.keypair.clone())
            .with_tokio()
            .with_tcp(
                tcp::Config::default(),
                noise::Config::new,
                yamux::Config::default,
            )
            .map_err(|e| e.to_string())?
            .with_quic()
            .with_behaviour(|_| stream::Behaviour::new())
            .map_err(|e| e.to_string())?
            .build();

        let mut control = swarm.behaviour().new_control();

        let mut voice_incoming = control
            .accept(StreamProtocol::new(VOICE_PROTOCOL))
            .map_err(|e| e.to_string())?;

        let mut ping_incoming = control
            .accept(StreamProtocol::new(PING_PROTOCOL))
            .map_err(|e| e.to_string())?;

        swarm
            .listen_on("/ip4/0.0.0.0/udp/0/quic-v1".parse().unwrap())
            .map_err(|e| e.to_string())?;

        swarm
            .listen_on("/ip4/0.0.0.0/tcp/0".parse().unwrap())
            .map_err(|e| e.to_string())?;

        {
            let mut c = self.stream_control.lock().await;
            *c = Some(control.clone());
        }

        let (tx, mut rx) = mpsc::unbounded_channel::<P2PCommand>();

        {
            let mut guard = self.cmd_tx.lock().await;
            *guard = Some(tx);
        }

        {
            let mut started = self.started.lock().await;
            *started = true;
        }

        let app_for_swarm = self.app.clone();
        let listen_addrs = self.listen_addrs.clone();

        tauri::async_runtime::spawn(async move {
            let mut fallback_addrs: HashMap<PeerId, Vec<Multiaddr>> = HashMap::new();
            let mut connected_peers: HashSet<PeerId> = HashSet::new();

            loop {
                tokio::select! {
                    cmd = rx.recv() => {
                        match cmd {
                            Some(P2PCommand::Dial { peer, mut addrs }) => {
                                if addrs.is_empty() {
                                    emit_log_arc(&app_for_swarm, "dial skipped: no addresses".to_string()).await;
                                    continue;
                                }

                                for addr in &addrs {
                                    swarm.add_peer_address(peer, addr.clone());
                                }

                                let first = addrs.remove(0);
                                fallback_addrs.insert(peer, addrs);

                                match swarm.dial(first.clone()) {
                                    Ok(_) => {
                                        emit_log_arc(
                                            &app_for_swarm,
                                            format!("dialing primary: {} (peer={})", first, peer),
                                        ).await;
                                    }
                                    Err(e) => {
                                        emit_log_arc(
                                            &app_for_swarm,
                                            format!("primary dial error [{}]: {}", peer, e),
                                        ).await;

                                        if let Some(rest) = fallback_addrs.get_mut(&peer) {
                                            if let Some(next) = rest.first().cloned() {
                                                rest.remove(0);
                                                match swarm.dial(next.clone()) {
                                                    Ok(_) => {
                                                        emit_log_arc(
                                                            &app_for_swarm,
                                                            format!("dialing fallback: {} (peer={})", next, peer),
                                                        ).await;
                                                    }
                                                    Err(e) => {
                                                        emit_log_arc(
                                                            &app_for_swarm,
                                                            format!("fallback dial error [{}]: {}", peer, e),
                                                        ).await;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            Some(P2PCommand::Close) | None => {
                                emit_log_arc(&app_for_swarm, "shutdown".to_string()).await;
                                break;
                            }
                        }
                    }

                    event = swarm.select_next_some() => {
                        match event {
                            SwarmEvent::NewListenAddr { address, .. } => {
                                {
                                    let mut addrs = listen_addrs.lock().await;

                                    if is_quic_addr(&address) {
                                        addrs.quic = Some(address.clone());
                                    } else if is_tcp_addr(&address) {
                                        addrs.tcp = Some(address.clone());
                                    }
                                }

                                emit_log_arc(&app_for_swarm, format!("listening: {}", address)).await;
                            }

                            SwarmEvent::ConnectionEstablished { peer_id, .. } => {
                                connected_peers.insert(peer_id);
                                fallback_addrs.remove(&peer_id);
                                emit_log_arc(&app_for_swarm, format!("connected: {}", peer_id)).await;
                            }

                            SwarmEvent::OutgoingConnectionError { peer_id, error, .. } => {
                                if let Some(peer) = peer_id {
                                    if connected_peers.contains(&peer) {
                                        emit_log_arc(
                                            &app_for_swarm,
                                            format!("outgoing error [{}]: {}", peer, error),
                                        ).await;
                                        continue;
                                    }

                                    let mut dialed_fallback = false;

                                    if let Some(rest) = fallback_addrs.get_mut(&peer) {
                                        if let Some(next) = rest.first().cloned() {
                                            rest.remove(0);

                                            match swarm.dial(next.clone()) {
                                                Ok(_) => {
                                                    dialed_fallback = true;
                                                    emit_log_arc(
                                                        &app_for_swarm,
                                                        format!("dialing fallback: {} (peer={})", next, peer),
                                                    ).await;
                                                }
                                                Err(e) => {
                                                    emit_log_arc(
                                                        &app_for_swarm,
                                                        format!("fallback dial error [{}]: {}", peer, e),
                                                    ).await;
                                                }
                                            }
                                        }
                                    }

                                    if !dialed_fallback {
                                        emit_log_arc(
                                            &app_for_swarm,
                                            format!("outgoing error [{}]: {}", peer, error),
                                        ).await;
                                    }
                                } else {
                                    emit_log_arc(
                                        &app_for_swarm,
                                        format!("outgoing error [-]: {}", error),
                                    ).await;
                                }
                            }

                            SwarmEvent::IncomingConnectionError { error, .. } => {
                                emit_log_arc(&app_for_swarm, format!("incoming error: {}", error)).await;
                            }

                            _ => {}
                        }
                    }
                }
            }
        });

        let app_for_voice = self.app.clone();
        tauri::async_runtime::spawn(async move {
            while let Some((peer, stream)) = voice_incoming.next().await {
                let app = app_for_voice.clone();
                tauri::async_runtime::spawn(async move {
                    handle_voice_stream(peer, stream, app).await;
                });
            }
        });

        let app_for_ping = self.app.clone();
        tauri::async_runtime::spawn(async move {
            while let Some((peer, mut stream)) = ping_incoming.next().await {
                let app = app_for_ping.clone();
                tauri::async_runtime::spawn(async move {
                    match read_frame(&mut stream).await {
                        Ok(Some(data)) => {
                            emit_log_arc(&app, format!("ping from {}: {} bytes", peer, data.len())).await;

                            if data == b"ping".to_vec() {
                                let _ = write_frame(&mut stream, b"pong").await;
                            }
                        }
                        Ok(None) => {}
                        Err(e) => {
                            emit_log_arc(&app, format!("ping read error [{}]: {}", peer, e)).await;
                        }
                    }
                });
            }
        });

        Ok(())
    }

    pub async fn dial(&self, peer: PeerId, addrs: Vec<Multiaddr>) -> Result<(), String> {
        let tx = self
            .cmd_tx
            .lock()
            .await
            .clone()
            .ok_or_else(|| "p2p not initialized".to_string())?;

        tx.send(P2PCommand::Dial { peer, addrs })
            .map_err(|_| "failed to send dial command".to_string())
    }

    pub async fn send(&self, peer: PeerId, data: Vec<u8>) -> Result<(), String> {
        let tx = {
            let mut writers = self.peer_writers.lock().await;

            if let Some(tx) = writers.get(&peer) {
                tx.clone()
            } else {
                let mut control = self
                    .stream_control
                    .lock()
                    .await
                    .clone()
                    .ok_or_else(|| "stream control not initialized".to_string())?;

                let (tx, mut rx) = mpsc::unbounded_channel::<Vec<u8>>();
                writers.insert(peer, tx.clone());

                let app = self.app.clone();
                let writers_ref = self.peer_writers.clone();

                tauri::async_runtime::spawn(async move {
                    let mut stream = match control
                        .open_stream(peer, StreamProtocol::new(VOICE_PROTOCOL))
                        .await
                    {
                        Ok(stream) => {
                            emit_log_arc(&app, format!("voice stream opened: {}", peer)).await;
                            stream
                        }
                        Err(e) => {
                            emit_log_arc(&app, format!("open voice stream error [{}]: {}", peer, e)).await;
                            let mut writers = writers_ref.lock().await;
                            writers.remove(&peer);
                            return;
                        }
                    };

                    while let Some(buf) = rx.recv().await {
                        if let Err(e) = write_frame(&mut stream, &buf).await {
                            emit_log_arc(&app, format!("voice write error [{}]: {}", peer, e)).await;
                            break;
                        }
                    }

                    let mut writers = writers_ref.lock().await;
                    writers.remove(&peer);
                });

                tx
            }
        };

        tx.send(data)
            .map_err(|_| "failed to queue outgoing voice packet".to_string())
    }

    pub async fn ping_peer(&self, peer: PeerId) -> Result<String, String> {
        let mut control = self
            .stream_control
            .lock()
            .await
            .clone()
            .ok_or_else(|| "stream control not initialized".to_string())?;

        let mut stream = control
            .open_stream(peer, StreamProtocol::new(PING_PROTOCOL))
            .await
            .map_err(|e| e.to_string())?;

        write_frame(&mut stream, b"ping").await?;

        let data = read_frame(&mut stream).await?
            .ok_or_else(|| "ping response eof".to_string())?;

        let text = String::from_utf8_lossy(&data).to_string();

        emit_log_arc(&self.app, format!("manual ping [{}]: {}", peer, text)).await;
        emit_event_arc(&self.app, "p2p-ping", text.clone()).await;

        Ok(text)
    }

    pub async fn close(&self) -> Result<(), String> {
        if let Some(tx) = self.cmd_tx.lock().await.take() {
            let _ = tx.send(P2PCommand::Close);
        }

        {
            let mut started = self.started.lock().await;
            *started = false;
        }

        {
            let mut addrs = self.listen_addrs.lock().await;
            *addrs = ListenAddrs::default();
        }

        {
            let mut writers = self.peer_writers.lock().await;
            writers.clear();
        }

        {
            let mut control = self.stream_control.lock().await;
            *control = None;
        }

        Ok(())
    }
}

fn is_quic_addr(addr: &Multiaddr) -> bool {
    addr.iter().any(|p| matches!(p, Protocol::QuicV1))
}

fn is_tcp_addr(addr: &Multiaddr) -> bool {
    addr.iter().any(|p| matches!(p, Protocol::Tcp(_)))
}

async fn handle_voice_stream(
    peer: PeerId,
    mut stream: Stream,
    app: Arc<Mutex<Option<AppHandle>>>,
) {
    loop {
        match read_frame(&mut stream).await {
            Ok(Some(data)) => {
                emit_log_arc(&app, format!("voice frame from {}: {} bytes", peer, data.len())).await;
                emit_event_arc(&app, "p2p-data", data).await;
            }
            Ok(None) => break,
            Err(e) => {
                emit_log_arc(&app, format!("voice read error [{}]: {}", peer, e)).await;
                break;
            }
        }
    }
}

async fn emit_log_arc(app: &Arc<Mutex<Option<AppHandle>>>, msg: String) {
    emit_event_arc(app, "p2p-log", msg).await;
}

async fn emit_event_arc<S>(app: &Arc<Mutex<Option<AppHandle>>>, event: &str, payload: S)
where
    S: serde::Serialize + Clone,
{
    if let Some(app) = app.lock().await.clone() {
        let _ = app.emit(event, payload);
    }
}

async fn write_frame(stream: &mut Stream, data: &[u8]) -> Result<(), String> {
    let len = (data.len() as u32).to_be_bytes();
    stream.write_all(&len).await.map_err(|e| e.to_string())?;
    stream.write_all(data).await.map_err(|e| e.to_string())?;
    stream.flush().await.map_err(|e| e.to_string())?;
    Ok(())
}

async fn read_frame(stream: &mut Stream) -> Result<Option<Vec<u8>>, String> {
    let mut len_buf = [0u8; 4];

    match stream.read_exact(&mut len_buf).await {
        Ok(_) => {}
        Err(e) if e.kind() == std::io::ErrorKind::UnexpectedEof => return Ok(None),
        Err(e) => return Err(e.to_string()),
    }

    let len = u32::from_be_bytes(len_buf) as usize;
    let mut data = vec![0u8; len];
    stream.read_exact(&mut data).await.map_err(|e| e.to_string())?;
    Ok(Some(data))
}