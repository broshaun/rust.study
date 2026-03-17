
import { Chat } from "./main";
import { RsFriend } from "./friend";
import { RsDialog } from "./dialog";
import { RsMyInfo } from "./myinfo";
import { Msg } from "./dialog/msg";
import { useHttpClient2 } from 'hooks/http';
import { useRequest, useTimeout } from 'ahooks';
import { db } from 'hooks/db';
import { useToken } from "hooks/store"
import { useNavigate, Outlet } from 'react-router';



export const RsChat = [
  {
    element: <ChatGuard />,
    children: [
      {
        path: "chat",
        element: <Chat />,
        children: [
          ...RsFriend,
          ...RsDialog,
          ...RsMyInfo,
        ],
      },
      {
        path: "message",
        element: <Msg />,
      },
    ],
  },
];


function ChatGuard() {

  const navigate = useNavigate();
  const { remainSeconds } = useToken()
  const { http: httpMsg } = useHttpClient2('/rpc/chat/msg/single/');


  useRequest(() => {
    httpMsg.post('POST').then((results) => {
      if (!results) return;
      const { code, data } = results;
      if (data && code === 200) {
        db.table('message').put({ 'uid': data?.uid, 'msg': data?.msg, 'timestamp': data?.timestamp, 'signal': 'receive' });
        db.table('friends').where('uid').equals(data?.uid).modify((user) => {
          user.signal = 'news';
          user.dialog = 1;
          user.timestamp = data?.timestamp
        });
      }
    });
    return 'ok';
  }, { pollingInterval: 2000, pollingWhenHidden: false });


  useTimeout(() => {
    console.log("登录到期，守护进程执行跳转");
    navigate('/user/login/', { replace: true });
  }, remainSeconds * 1000);

  return <Outlet />
}