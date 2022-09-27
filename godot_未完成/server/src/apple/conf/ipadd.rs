use super::*;



pub struct Conf{
    base:PathBuf
}
impl Conf {
    fn new() -> Self { 
        Self { base:PathBuf::from(Path::new(".")) } 
    }

    pub fn udp() -> SocketAddr {
        let Self{ref base} = Self::new();
        let file = base.join("conf").join("ipadd.ini");
        let mut config = Ini::new();
        config.load(file).unwrap();
        let host = config.get("udp", "host").unwrap_or("127.0.0.1".to_owned());
        let port = config.get("udp", "port").unwrap_or("0".to_owned());
        format!("{}:{}", host, port).parse().unwrap()
    }

    pub fn web() -> SocketAddr {
        let Self{ref base} = Self::new();
        let file = base.join("conf").join("ipadd.ini");
        let mut config = Ini::new();
        config.load(file).unwrap();
        let host = config.get("web", "host").unwrap_or("127.0.0.1".to_owned());
        let port = config.get("web", "port").unwrap_or("0".to_owned());
        format!("{}:{}", host, port).parse().unwrap()
    }


}
