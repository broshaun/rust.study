import { P2PCallReceiver } from "./ui/P2PCallReceiver";
import { useNavigate, useLocation,useParams } from 'react-router';
import { currentAppBar } from 'utils';
import { useEffect } from "react"




export function Receiver() {
  const { id: friendId } = useParams();
  const { fnSendMsg, msgFriend: current } = useOutletContext();
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  useEffect(() => {
    setLeftPath(`/mobile/chat/message/${friendId}`)
  }, [])

  const navigate = useNavigate();
  const location = useLocation();
  const { ticket } = location.state || {};
  // console.log('接听ticket', ticket)
  const handleStopCall = () => {
    navigate(`/mobile/chat/message/${friendId}`)
  }

  return <div>
    <P2PCallReceiver
      avatar={current?.avatar_url}
      name={current?.displayName}
      ticket={ticket}
      onStopCall={handleStopCall}
    />
  </div>


}