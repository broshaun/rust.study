import { useNavigate, useOutletContext } from 'react-router';
import { P2PCallCaller } from "./UI/P2PCallCaller";
import { currentAppBar, currentChat } from 'utils';
import { useEffect } from "react"


export function Caller() {
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  const current_friend = currentChat(
    (state) => state.current.get("friend")
  );
  useEffect(() => {
    setLeftPath('/mobile/chat/message/')
  }, [])

  const { fnSendMsg, db } = useOutletContext();
  const msgPhoneSend = async (ticket) => {
    if (ticket) {
      await fnSendMsg({ uid: current_friend?.uid, msgType: 'phone', msgText: ticket })
    }
  }

  const handleStartCall = (ticket) => {
    console.log('开启通话,ticket:', ticket)
    msgPhoneSend(ticket)
  }

  const navigate = useNavigate();
  const handleStopCall = () => {
    console.log("挂断退出")
    navigate('/mobile/chat/message/')
  }

  return <div>
    <P2PCallCaller
      avatar={current?.avatar_url}
      name={current?.displayName}
      onStartCall={handleStartCall}
      onStopCall={handleStopCall}
    />
  </div>


}