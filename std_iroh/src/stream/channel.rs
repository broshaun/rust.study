use tokio::sync::{
    Mutex, OnceCell,
    mpsc::{channel, Receiver, Sender},
};
use anyhow::{Context, Result, anyhow};

#[derive(Clone, Debug)]
pub enum ChannelMessage {
    Data(Vec<u8>),
    Stop,
}
#[derive(Debug)]
pub struct GlobalChannels {
    // App -> P2P
    pub outgoing_tx: Sender<ChannelMessage>,
    pub outgoing_rx: Mutex<Receiver<ChannelMessage>>,
    // P2P -> App
    pub incoming_tx: Sender<ChannelMessage>,
    pub incoming_rx: Mutex<Receiver<ChannelMessage>>,
}

static GLOBAL_CHANNELS: OnceCell<GlobalChannels> = OnceCell::const_new();

pub fn init_channels() -> Result<()> {
    let (outgoing_tx, outgoing_rx) = channel::<ChannelMessage>(100);
    let (incoming_tx, incoming_rx) = channel::<ChannelMessage>(100);
    GLOBAL_CHANNELS
        .set(GlobalChannels {
            outgoing_tx,
            outgoing_rx: Mutex::new(outgoing_rx),
            incoming_tx,
            incoming_rx: Mutex::new(incoming_rx),
        })?;
    Ok(())
}

