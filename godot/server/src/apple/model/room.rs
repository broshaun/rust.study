use super::*;
use conf::buffer;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Ip {
    pub ip: String,
    pub time: SystemTime,
}

impl Ip {
    pub fn new(ip: String) -> Self {
        Self {
            ip,
            time: SystemTime::now(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Room {
    pub key: i32,
    pub ip_list: Vec<Ip>,
}
impl Room {
    pub fn new(key: i32) -> Self {
        Self {
            key,
            ip_list: Vec::new(),
        }
    }

    // 提取IP
    pub fn ip(&self) -> Vec<String> {
        let mut ip_list = Vec::<String>::new();
        for i in &self.ip_list {
            ip_list.push(i.ip.clone())
        }
        ip_list
    }

    // 房间过期删除
    pub fn expired(&mut self, ip: String) -> Result<Self> {
        let exp = Duration::from_secs(60); //60s过期
        let mut ip_list = Vec::<Ip>::new();
        let mut is_include = false;

        for ipiter in self.ip_list.iter() {
            if ip == ipiter.ip {
                is_include = true;
                ip_list.push(Ip::new(ip.to_owned()));
            } else {
                match ipiter.time.elapsed() {
                    Ok(ds) => {
                        if ds < exp {
                            ip_list.push(Ip {
                                ip: ipiter.ip.clone(),
                                time: ipiter.time.clone(),
                            })
                        }
                    }
                    Err(err) => return Err(err.into()),
                }
            }
        }

        if !is_include {
            ip_list.push(Ip::new(ip.to_owned()));
        }

        self.ip_list = ip_list;
        Ok(self.to_owned())
    }

    // 离开房间
    pub fn delete(&mut self, ip: String) -> Self {
        let mut ip_list = Vec::<Ip>::new();
        for ipiter in self.ip_list.iter() {
            if ip != ipiter.ip {
                ip_list.push(Ip {
                    ip: ipiter.ip.clone(),
                    time: ipiter.time.clone(),
                })
            }
        }
        self.ip_list = ip_list;
        self.to_owned()
    }

    // Udp通知更新房间信息
    pub async fn udp_send(&self) -> Result<()> {
        //带头信息
        // let tx = get_sender();
        let tx = buffer::SqMsg::get_sender();
        let head = cmsg::Head {
            cs: cmsg::Class::ROOM,
            seq: 0,
            next: 1
        };

        let room = Room {
            key: self.key,
            ip_list: Vec::<Ip>::new(),
        };

        let data = cmsg::Data::new(head, Some(room));
        let buf = data.make()?;

        for i in self.ip_list.iter() {
            tx.send_async(cmsg::CMsg {
                buf,
                ipadd: i.ip.to_owned(),
            })
            .await?;
            //追加信息
            for (j, v) in self.ip_list.iter().enumerate() {
                let head = cmsg::Head {
                    cs: cmsg::Class::ROOM,
                    seq: j + 1,
                    next: -1
                };
                let data = cmsg::Data::new(head, Some(v));
                let buf = data.make()?;
                tx.send_async(cmsg::CMsg {
                    buf,
                    ipadd: i.ip.to_owned(),
                })
                .await?;
            }
        }

        Ok(())
    }
}
