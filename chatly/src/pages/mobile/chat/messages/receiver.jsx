import { P2PCallReceiver } from "./ui/P2PCallReceiver";
import { Outlet, useNavigate, useOutletContext } from 'react-router';
import { currentChat } from 'utils';



export function Receiver() {


  const handleStopCall =() =>{
    console.log("123挂断退出")
    navigate('/mobile/chat/message/msg/')
  }

  return <div>
    <P2PCallReceiver
        ticket=""
        onStopCall={handleStopCall}
    />
  </div>


}