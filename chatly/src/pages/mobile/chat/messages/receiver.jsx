import { P2PCallReceiver } from "./UI/P2PCallReceiver";
import { Outlet, useNavigate, useOutletContext, useLocation } from 'react-router';
import { currentChat } from 'utils';



export function Receiver() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ticket } = location.state || {};

  console.log('接听ticket',ticket)

  const handleStopCall = () => {
    console.log("123挂断退出")
    navigate('/mobile/chat/message/msg/')
  }

  return <div>
    <P2PCallReceiver
      ticket={ticket}
      onStopCall={handleStopCall}
    />
  </div>


}