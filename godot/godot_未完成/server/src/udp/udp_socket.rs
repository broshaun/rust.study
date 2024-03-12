use super::*;
use model::{cmsg,room};
use conf::{buffer};


/**
 * UDP Socket 服务封装
 */
pub struct UdpServer {
    sock: UdpSocket,
}
impl UdpServer {
    /**
     * 创建 udp socket
     */
    pub async fn new(addr:SocketAddr) -> Result<Self> {
        let sock = UdpSocket::bind(addr).await?;
        Ok(Self {sock})
    }

    /**
     * 从通道接收数据，然后由udp socket发送数据
     */
    pub async fn udp_sender(&self,msg:cmsg::CMsg) -> Result<usize> {
        let cmsg::CMsg { ref buf, ref ipadd } = msg;
        let len = self.sock.send_to(&buf.bytes, ipadd).await?;
        println!("发送成功，发送数据至{:?} ", ipadd);
        Ok(len)
    }

    /**
     *  udp socket接收数据
     */
    pub async fn udp_accept(&self) -> Result<cmsg::Class> {
        let mut buf = cmsg::Buf::new();

        let (len, addr) = self.sock.recv_from(&mut buf.bytes).await?;
        println!("upd接收数据长度:{:?},发送源地址：{:?}", len, addr);
        let head = buf.get_head()?;
        match head.cs {
            cmsg::Class::NAT => {
                // 获取公网IP
                let ipa: String = buf.get_content()?;
                // buffer::MyIPA::set(ipa.clone());
                println!("得到公网地址：{:?}", ipa);
        
            }
            cmsg::Class::ROOM => {
                // 房间数据
                let r: room::Room = buf.get_content()?;
                let ipa_list = r.ip();
                buffer::OthersIPA::set(ipa_list.clone());
                println!("收到更新房间消息：{:?}", ipa_list);
            }
            cmsg::Class::STATS => {
                // 角色状态
                let tx = buffer::RqStats::get_sender();
                tx.send_async(buf.get_content()?).await?;
            }
            cmsg::Class::ACTION => {
                // 角色状态
                let tx = buffer::RqAction::get_sender();
                tx.send_async(buf.get_content()?).await?;
            }
            other => {
                println!("未定义解析：{:?}", other);
            }
        };
        Ok(head.cs)
    }
}
