use tokio_modbus::prelude::{Reader,rtu,Slave};
use tokio_serial::SerialStream;


#[tokio::main]
async fn main() {
    
    match test_rtu().await {
        Ok(vc) => {
            println!("read_holding_registers读取:{:?}",vc)
        }
        Err(e)=>{
            println!("read_holding_registers错误:{:?}",e)
        }
    }
}


async fn test_rtu() -> Result<Vec<u16>,String> {


    let tty_path = "COM1";
    let slave = Slave(1); 

    let builder = tokio_serial::new(tty_path, 9600);

    let port = match SerialStream::open(&builder){
        Ok(p)=>p,
        Err(e)=>{
            return Err(format!("{:#?}",e))
        }
    };

    let mut ctx = rtu::attach_slave(port, slave);
    
    let rsp =  match ctx.read_holding_registers(0x0000, 1).await{
        Ok(p)=>{
            println!("Reading a sensor value");
            p 
        }
        Err(e)=>{
            return Err(format!("{:#?}",e))
        }
    };

    println!("Sensor value is: {rsp:?}");

    Ok(rsp)
}