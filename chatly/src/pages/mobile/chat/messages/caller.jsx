import { Outlet, useNavigate, useOutletContext } from 'react-router';
import { P2PCallCaller } from "./UI/P2PCallCaller";
import { currentAppBar, currentChat } from 'utils';



export function Caller() {
  const navigate = useNavigate();
  const { fnSendMsg, loading, joinPathImg30, joinPathAvatar, db } = useOutletContext();

  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  setLeftPath('/mobile/chat/message/')

  const current = currentChat((s) => s.current);

  const senddd = async (ticket) => {
    if (ticket) {
      await fnSendMsg({ uid: current?.uid, msgText: `[phone]${ticket}` })
    }
  }

  const handleStartCall = (ticket) => {
    console.log('开启通话,ticket:', ticket)
    senddd(ticket)

  }

  const handleStopCall = () => {
    console.log("挂断退出")
    navigate('/mobile/chat/message/')
  }

  return <div>
    <P2PCallCaller
      onStartCall={handleStartCall}
      onStopCall={handleStopCall}
    />
  </div>


}