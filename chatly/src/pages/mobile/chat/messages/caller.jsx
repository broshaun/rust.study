import { useNavigate, useOutletContext, useParams } from 'react-router';
import { P2PCallCaller } from "./ui/P2PCallCaller";
import { currentAppBar } from 'utils';
import { useEffect } from "react"


export function Caller() {
  const { fnSendMsg, msgFriend: current } = useOutletContext();
  const { id: friendId } = useParams();
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  

  useEffect(() => {
    setLeftPath(`/mobile/chat/message/${friendId}`)
  }, [])

  const msgPhoneSend = async (ticket) => {
    if (ticket) {
      await fnSendMsg({ msgType: 'phone', msgText: ticket })
    }
  }

  const handleStartCall = (ticket) => {
    // console.log('开启通话,ticket:', ticket)
    msgPhoneSend(ticket)
  }

  const navigate = useNavigate();
  const handleStopCall = () => {
    navigate(`/mobile/chat/message/${friendId}`)
  }

  return <div>
    <P2PCallCaller
      avatar={current?.avatar_url}
      name={current?.remark || current?.nickname || current?.email}
      onStartCall={handleStartCall}
      onStopCall={handleStopCall}
    />
  </div>


}