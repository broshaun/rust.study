use bytes::Bytes;
use quinn::{ClientConfig, Connection, Endpoint, ServerConfig};
use rcgen::generate_simple_self_signed;
use rustls::pki_types::{CertificateDer, PrivatePkcs8KeyDer, UnixTime};
use std::{net::SocketAddr, sync::Arc};
use tauri::async_runtime::JoinHandle;
use tokio::sync::RwLock;

#[derive(Default)]
pub struct QuicTransportInner {
    pub endpoint: Option<Endpoint>,
    pub connection: Option<Connection>,
    pub server_task: Option<JoinHandle<()>>,
}

#[derive(Clone, Default)]
pub struct QuicTransportState {
    pub inner: Arc<RwLock<QuicTransportInner>>,
}

impl QuicTransportState {
    pub async fn init_node(&self, bind_addr: SocketAddr) -> Result<Endpoint, String> {
        println!("[init_node] bind_addr = {}", bind_addr);

        let server_config = make_self_signed_server_config()?;
        let client_config = make_insecure_client_config()?;

        let mut endpoint = Endpoint::server(server_config, bind_addr)
            .map_err(|e| e.to_string())?;

        endpoint.set_default_client_config(client_config);

        let mut inner = self.inner.write().await;
        inner.endpoint = Some(endpoint.clone());

        println!("[init_node] endpoint ready (server + client)");
        Ok(endpoint)
    }

    pub async fn set_connection(&self, connection: Connection) {
        let mut inner = self.inner.write().await;
        inner.connection = Some(connection);
    }

    pub async fn set_server_task(&self, handle: JoinHandle<()>) {
        let mut inner = self.inner.write().await;
        inner.server_task = Some(handle);
    }

    pub async fn has_endpoint(&self) -> bool {
        let inner = self.inner.read().await;
        inner.endpoint.is_some()
    }

    pub async fn has_connection(&self) -> bool {
        let inner = self.inner.read().await;
        inner.connection.is_some()
    }

    pub async fn connect(
        &self,
        remote_addr: SocketAddr,
        server_name: &str,
    ) -> Result<Connection, String> {
        println!(
            "[connect] remote_addr = {}, server_name = {}",
            remote_addr, server_name
        );

        let endpoint = {
            let inner = self.inner.read().await;
            inner
                .endpoint
                .as_ref()
                .cloned()
                .ok_or_else(|| "endpoint not initialized".to_string())?
        };

        let connecting = endpoint
            .connect(remote_addr, server_name)
            .map_err(|e| e.to_string())?;

        let connection = connecting.await.map_err(|e| e.to_string())?;
        self.set_connection(connection.clone()).await;

        println!("[connect] connection established");
        Ok(connection)
    }

    pub async fn send_datagram(&self, payload: Vec<u8>) -> Result<(), String> {
        let connection = {
            let inner = self.inner.read().await;
            inner
                .connection
                .as_ref()
                .cloned()
                .ok_or_else(|| "connection not established".to_string())?
        };

        connection
            .send_datagram(Bytes::from(payload))
            .map_err(|e| e.to_string())
    }

    pub async fn close(&self) {
        println!("[quic_close] closing transport");

        let mut inner = self.inner.write().await;

        if let Some(task) = inner.server_task.take() {
            println!("[quic_close] aborting server task");
            task.abort();
        }

        if let Some(conn) = inner.connection.take() {
            println!("[quic_close] closing connection");
            conn.close(0u32.into(), b"closed");
        }

        if inner.endpoint.take().is_some() {
            println!("[quic_close] dropping endpoint");
        }
    }
}

pub fn make_self_signed_server_config() -> Result<ServerConfig, String> {
    println!("[make_self_signed_server_config] generating self-signed cert");

    let cert = generate_simple_self_signed(vec!["localhost".into()])
        .map_err(|e| e.to_string())?;

    let cert_der = cert.serialize_der().map_err(|e| e.to_string())?;
    let key_der = cert.serialize_private_key_der();

    let cert_chain = vec![CertificateDer::from(cert_der)];
    let key = PrivatePkcs8KeyDer::from(key_der);

    ServerConfig::with_single_cert(cert_chain, key.into())
        .map_err(|e| e.to_string())
}

pub fn make_insecure_client_config() -> Result<ClientConfig, String> {
    use rustls::{
        client::danger::{
            HandshakeSignatureValid,
            ServerCertVerified,
            ServerCertVerifier,
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
                SignatureScheme::RSA_PSS_SHA256,
                SignatureScheme::RSA_PKCS1_SHA256,
                SignatureScheme::ED25519,
            ]
        }
    }

    println!("[make_insecure_client_config] building insecure client config");

    let crypto = RustlsClientConfig::builder()
        .dangerous()
        .with_custom_certificate_verifier(Arc::new(NoVerifier))
        .with_no_client_auth();

    let quic_crypto = quinn::crypto::rustls::QuicClientConfig::try_from(crypto)
        .map_err(|e| e.to_string())?;

    println!("[make_insecure_client_config] client config ready");

    Ok(ClientConfig::new(Arc::new(quic_crypto)))
}