use tokio_modbus::prelude::{Reader,rtu,Slave};
use tokio_serial::SerialStream;


#[tauri::command]
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


#[tauri::command]
fn cmd_a() -> String {
    String::from("Command a")
}

#[tauri::command]
fn cmd_b() -> String {
    "Command b".to_string()
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![cmd_a, cmd_b, test_rtu])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}