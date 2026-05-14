import { Outlet, useNavigate, useOutletContext } from 'react-router';
import { P2PCallCaller } from "./ui";



export function Caller() {

  const { fnSendMsg, loading, joinPathImg30, joinPathAvatar, db } = useOutletContext();

  const handleStartCall = (ticket) => {
    console.log('ticket',ticket)
  }


  const senddd = async () => {
        if (sendText) {
            await fnSendMsg({ uid: current?.uid, msgText: sendText })
        }
        setSendText(() => "")
        return 'ok'
    }



  return <div>
    <P2PCallCaller
      onTicket={handleStartCall}
    />
  </div>


}