import { P2PCallReceiver } from "./ui/P2PCallReceiver";
import { useNavigate, useLocation } from 'react-router';
import { currentAppBar, currentChat } from 'utils';
import { useEffect } from "react"




export function Receiver() {
  const current = currentChat(
    (state) => state.current.get("friend")
  );
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  useEffect(() => {
    setLeftPath('/mobile/chat/message/')
  }, [])

  const navigate = useNavigate();
  const location = useLocation();
  const { ticket } = location.state || {};
  // console.log('接听ticket', ticket)
  const handleStopCall = () => {
    navigate('/mobile/chat/message/')
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