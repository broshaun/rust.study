use super::*;


pub struct WEB{
    base:PathBuf
}
impl WEB {
    pub fn new() -> Self { 
        Self { base:PathBuf::from(Path::new(".")) } 
    }

    pub fn https() -> String {
        let Self{ref base} = Self::new();
        let file = base.join("conf").join("ipadd.ini");
        let mut config = Ini::new();
        config.load(file).unwrap();
        let host = config.get("https", "host").unwrap_or("127.0.0.1".to_owned());
        let port = config.get("https", "port").unwrap_or("0".to_owned());
        format!("{}:{}", host, port)
    }


}
