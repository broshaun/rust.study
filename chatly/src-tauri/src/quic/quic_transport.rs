use bytes::Bytes;
use quinn::{ClientConfig, Connection, Endpoint, ServerConfig};
use rcgen::generate_simple_self_signed;
use rustls::pki_types::{CertificateDer, PrivatePkcs8KeyDer, UnixTime};
use std::{net::SocketAddr, sync::Arc};
use tauri::{async_runtime::JoinHandle, ipc::Channel};
use tokio::sync::RwLock;

#[derive(Default)]
pub struct QuicInner {
    pub endpoint: Option<Endpoint>,
    pub connection: Option<Connection>,
    pub server_task: Option<JoinHandle<()>>,
    pub recv_task: Option<JoinHandle<()>>,
}

#[derive(Clone, Default)]
pub struct QuicState {
    pub inner: Arc<RwLock<QuicInner>>,
    pub downlink_channel: Arc<RwLock<Option<Channel<Vec<u8>>>>>,
}

impl QuicState {

    pub async fn set_downlink_channel(&self, channel: Channel<Vec<u8>>) {
        let mut ch = self.downlink_channel.write().await;
        *ch = Some(channel);
    }

    pub async fn init_node(&self, bind_addr: SocketAddr) -> Result<Endpoint, String> {
        let server_config = build_server_config()?;
        let client_config = build_client_config()?;

        let mut endpoint =
            Endpoint::server(server_config, bind_addr).map_err(|e| e.to_string())?;

        endpoint.set_default_client_config(client_config);

        {
            let inner = self.inner.read().await;
            if inner.endpoint.is_some() {
                return Err("QUIC endpoint already initialized".to_string());
            }
        }

        self.start_accept_loop(endpoint.clone()).await;

        let mut inner = self.inner.write().await;
        inner.endpoint = Some(endpoint.clone());

        Ok(endpoint)
    }

    pub async fn set_connection(&self, connection: Connection) {
        {
            let mut inner = self.inner.write().await;
            inner.connection = Some(connection.clone());

            if let Some(task) = inner.recv_task.take() {
                task.abort();
            }
        }

        self.start_recv_loop(connection).await;
    }

    pub async fn connect(
        &self,
        remote_addr: SocketAddr,
        server_name: &str,
    ) -> Result<Connection, String> {
        let endpoint = {
            let inner = self.inner.read().await;
            inner
                .endpoint
                .as_ref()
                .cloned()
                .ok_or_else(|| "QUIC endpoint not initialized".to_string())?
        };

        let connecting = endpoint
            .connect(remote_addr, server_name)
            .map_err(|e| e.to_string())?;

        let connection = connecting.await.map_err(|e| e.to_string())?;
        self.set_connection(connection.clone()).await;

        Ok(connection)
    }

    pub async fn send_bytes(&self, payload: Vec<u8>) -> Result<(), String> {
        let conn = {
            let inner = self.inner.read().await;
            inner
                .connection
                .as_ref()
                .cloned()
                .ok_or_else(|| "QUIC connection not established".to_string())?
        };

        let max = conn
            .max_datagram_size()
            .ok_or_else(|| "peer does not support QUIC datagrams".to_string())?
            as usize;

        if payload.len() > max {
            return Err(format!(
                "payload too large for datagram: {} > {}",
                payload.len(),
                max
            ));
        }

        conn.send_datagram(Bytes::from(payload))
            .map_err(|e| e.to_string())
    }

    async fn start_accept_loop(&self, endpoint: Endpoint) {
        let state = self.clone();

        let task = tauri::async_runtime::spawn(async move {
            while let Some(incoming) = endpoint.accept().await {
                match incoming.await {
                    Ok(connection) => {
                        state.set_connection(connection).await;
                    }
                    Err(_) => break,
                }
            }
        });

        let mut inner = self.inner.write().await;
        if let Some(old) = inner.server_task.take() {
            old.abort();
        }
        inner.server_task = Some(task);
    }

    async fn start_recv_loop(&self, connection: Connection) {
        let state = self.clone();

        let task = tauri::async_runtime::spawn(async move {
            loop {
                match connection.read_datagram().await {
                    Ok(bytes) => {
                        let ch = state.downlink_channel.read().await;
                        if let Some(channel) = ch.as_ref() {
                            let _ = channel.send(bytes.to_vec());
                        }
                    }
                    Err(_) => break,
                }
            }
        });

        let mut inner = self.inner.write().await;
        if let Some(old) = inner.recv_task.take() {
            old.abort();
        }
        inner.recv_task = Some(task);
    }

    pub async fn close(&self) {
        let mut inner = self.inner.write().await;

        if let Some(task) = inner.server_task.take() {
            task.abort();
        }

        if let Some(task) = inner.recv_task.take() {
            task.abort();
        }

        if let Some(conn) = inner.connection.take() {
            conn.close(0u32.into(), b"closed");
        }

        inner.endpoint = None;

        let mut ch = self.downlink_channel.write().await;
        *ch = None;
    }
}

fn build_server_config() -> Result<ServerConfig, String> {
    let certified = generate_simple_self_signed(vec!["localhost".into()])
        .map_err(|e| e.to_string())?;

    let cert_der = certified.cert.der().to_vec();
    let key_der = certified.key_pair.serialize_der();

    let cert_chain = vec![CertificateDer::from(cert_der)];
    let key = PrivatePkcs8KeyDer::from(key_der);

    ServerConfig::with_single_cert(cert_chain, key.into()).map_err(|e| e.to_string())
}

fn build_client_config() -> Result<ClientConfig, String> {
    use rustls::{
        client::danger::{
            HandshakeSignatureValid, ServerCertVerified, ServerCertVerifier,
        },
        ClientConfig as RustlsClientConfig,
        DigitallySignedStruct,
        SignatureScheme,
    };

    #[derive(Debug)]
    struct NoVerifier;

    impl ServerCertVerifier for NoVerifier {
        fn verify_server_cert(
            &self,
            _end_entity: &CertificateDer<'_>,
            _intermediates: &[CertificateDer<'_>],
            _server_name: &rustls::pki_types::ServerName<'_>,
            _ocsp_response: &[u8],
            _now: UnixTime,
        ) -> Result<ServerCertVerified, rustls::Error> {
            Ok(ServerCertVerified::assertion())
        }

        fn verify_tls12_signature(
            &self,
            _message: &[u8],
            _cert: &CertificateDer<'_>,
            _dss: &DigitallySignedStruct,
        ) -> Result<HandshakeSignatureValid, rustls::Error> {
            Ok(HandshakeSignatureValid::assertion())
        }

        fn verify_tls13_signature(
            &self,
            _message: &[u8],
            _cert: &CertificateDer<'_>,
            _dss: &DigitallySignedStruct,
        ) -> Result<HandshakeSignatureValid, rustls::Error> {
            Ok(HandshakeSignatureValid::assertion())
        }

        fn supported_verify_schemes(&self) -> Vec<SignatureScheme> {
            vec![
                SignatureScheme::ECDSA_NISTP256_SHA256,
                SignatureScheme::ECDSA_NISTP384_SHA384,
                SignatureScheme::RSA_PSS_SHA256,
                SignatureScheme::RSA_PKCS1_SHA256,
                SignatureScheme::ED25519,
            ]
        }
    }

    let crypto = RustlsClientConfig::builder()
        .dangerous()
        .with_custom_certificate_verifier(Arc::new(NoVerifier))
        .with_no_client_auth();

    let quic_crypto =
        quinn::crypto::rustls::QuicClientConfig::try_from(crypto).map_err(|e| e.to_string())?;

    Ok(ClientConfig::new(Arc::new(quic_crypto)))
}