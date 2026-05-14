import { Outlet, useNavigate, useOutletContext } from 'react-router';
import { P2PCallCaller } from "./ui/P2PCallCaller";
import { currentChat } from 'utils';



export function Caller() {
  const navigate = useNavigate();
  const { fnSendMsg, loading, joinPathImg30, joinPathAvatar, db } = useOutletContext();

  const handleStartCall = (ticket) => {
    console.log('开启通话,ticket:',ticket)
  }

  const handleStopCall =() =>{
    console.log("123挂断退出")
    navigate('/mobile/chat/message/msg/')
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
      onStartCall={handleStartCall}
      onStopCall={handleStopCall}
    />
  </div>


}