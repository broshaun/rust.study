use std::path::{PathBuf,Path};
use configparser::ini::Ini;

pub struct Conf {
    path:PathBuf
}

impl Conf {
    pub fn base() -> Self { 
        Conf{path:PathBuf::from(Path::new("."))}
    }

    pub fn tcp(&self) -> String {
        let base = self.path.clone();
        let config_path = base.join("config").join("db.ini");
        let mut config = Ini::new();
        config.load(config_path).unwrap();
        let host = config.get("web", "host").unwrap_or("0.0.0.0".to_owned());
        let port = config.get("web", "port").unwrap_or("5050".to_owned());
        format!("{}:{}", host, port)
    }
    pub fn udp(&self) -> String {
        let base = self.path.clone();
        let config_path = base.join("config").join("db.ini");
        let mut config = Ini::new();
        config.load(config_path).unwrap();
        let host = config.get("web", "host").unwrap_or("0.0.0.0".to_owned());
        let port = config.get("web", "port").unwrap_or("5050".to_owned());
        format!("{}:{}", host, port)
    }
    pub fn amqp(&self) -> String {
        let base = self.path.clone();
        let config_path = base.join("config").join("db.ini");
        let mut config = Ini::new();
        config.load(config_path).unwrap();
        let user = config.get("amqp", "user").unwrap_or("rabbitmq".to_owned());
        let password = config.get("amqp", "password").unwrap_or("123456".to_owned());
        let host = config.get("amqp", "host").unwrap_or("localhost".to_owned());
        let port = config.get("amqp", "port").unwrap_or("5672".to_owned());
        format!("amqp://{}:{}@{}:{}", user, password, host, port)
    }

}


