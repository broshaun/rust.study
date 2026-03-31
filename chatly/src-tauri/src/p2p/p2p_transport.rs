use std::{collections::HashMap, sync::Arc};

use futures::{AsyncReadExt, AsyncWriteExt, StreamExt};
use libp2p::{
    core::upgrade,
    identity,
    noise,
    swarm::{NetworkBehaviour, Swarm, SwarmEvent},
    tcp,
    yamux,
    Multiaddr, PeerId, StreamProtocol,
};
use tokio::sync::Mutex;

const PROTOCOL: &str = "/zoey/raw/1.0.0";

#[derive(NetworkBehaviour)]
pub struct Behaviour {}

pub struct P2PState {
    pub peer_id: PeerId,
    pub swarm: Arc<Mutex<Swarm<Behaviour>>>,
    pub streams: Arc<Mutex<HashMap<String, libp2p::Stream>>>,
}

impl Default for P2PState {
    fn default() -> Self {
        let id_keys = identity::Keypair::generate_ed25519();
        let peer_id = PeerId::from(id_keys.public());

        let transport = tcp::tokio::Transport::default()
            .upgrade(upgrade::Version::V1)
            .authenticate(noise::Config::new(&id_keys).unwrap())
            .multiplex(yamux::Config::default())
            .boxed();

        let behaviour = Behaviour {};

        let mut swarm = Swarm::new(transport, behaviour, peer_id);

        swarm
            .listen_on("/ip4/0.0.0.0/tcp/0".parse().unwrap())
            .unwrap();

        let state = Self {
            peer_id,
            swarm: Arc::new(Mutex::new(swarm)),
            streams: Arc::new(Mutex::new(HashMap::new())),
        };

        state.start_event_loop();
        state
    }
}

impl P2PState {
    fn start_event_loop(&self) {
        let swarm = self.swarm.clone();
        let streams = self.streams.clone();

        tokio::spawn(async move {
            let mut swarm = swarm.lock().await;

            loop {
                match swarm.next().await {
                    Some(SwarmEvent::ConnectionEstablished { peer_id, .. }) => {
                        if let Ok(stream) = swarm
                            .dial_protocol(peer_id, StreamProtocol::new(PROTOCOL))
                        {
                            streams
                                .lock()
                                .await
                                .insert(peer_id.to_string(), stream);
                        }
                    }

                    Some(SwarmEvent::IncomingStream { peer_id, stream, .. }) => {
                        streams
                            .lock()
                            .await
                            .insert(peer_id.to_string(), stream);
                    }

                    Some(_) => {}

                    None => break,
                }
            }
        });

        self.start_read_loop();
    }

    fn start_read_loop(&self) {
        let streams = self.streams.clone();

        tokio::spawn(async move {
            loop {
                let mut map = streams.lock().await;

                for (_peer, stream) in map.iter_mut() {
                    let mut buf = [0u8; 2048];

                    match stream.read(&mut buf).await {
                        Ok(n) if n > 0 => {
                            println!("recv {} bytes", n);
                        }
                        _ => {}
                    }
                }

                drop(map);
                tokio::time::sleep(std::time::Duration::from_millis(10)).await;
            }
        });
    }
}