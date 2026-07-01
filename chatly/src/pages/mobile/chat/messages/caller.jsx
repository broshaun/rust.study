import { useNavigate, useOutletContext, useParams } from 'react-router';
import { P2PCallCaller } from "./ui/P2PCallCaller";
import { currentAppBar } from 'utils';
import { useEffect } from "react"


export function Caller() {
  const { fnSendMsg, db } = useOutletContext();
  const { id: friendId } = useParams();
  const setLeftPath = currentAppBar((state) => state.setLeftPath);

  const current = useLiveQuery(async () => {
    return await db.table('friends').get(friendId)
  })

  

  useEffect(() => {
    setLeftPath('/mobile/chat/message/')
  }, [])


  const msgPhoneSend = async (ticket) => {
    if (ticket) {
      await fnSendMsg({ uid: current?.uid, msgType: 'phone', msgText: ticket })
    }
  }

  const handleStartCall = (ticket) => {
    console.log('开启通话,ticket:', ticket)
    msgPhoneSend(ticket)
  }

  const navigate = useNavigate();
  const handleStopCall = () => {
    navigate('/mobile/chat/message/')
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