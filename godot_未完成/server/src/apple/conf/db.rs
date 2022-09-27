use super::*;

pub struct Conf{
    base:PathBuf
}
impl Conf {
    fn new() -> Self { 
        Self { base:PathBuf::from(Path::new(".")) } 
    }

    pub fn mongo() -> String {
        let Self{ref base} = Self::new();
        let file = base.join("conf").join("db.ini");
        let mut config = Ini::new();
        config.load(file).unwrap();
        let host = config.get("mongo", "host").unwrap_or("127.0.0.1".to_owned());
        let port = config.get("remote_server", "port").unwrap_or("27017".to_owned());

        let host = "118.193.46.124";
        let port = 27017;
        let user = "root";
        let password = "aak123456";
        format!("mongodb://{}:{}@{}:{}", user, password, host, port)
    }

}