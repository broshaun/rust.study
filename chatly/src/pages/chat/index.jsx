import React, { useEffect } from "react";
import { useNavigate, Outlet } from 'react-router';
import { Chat } from "./main";
import { RsFriend } from "./friend";
import { RsDialog } from "./dialog";
import { RsMyInfo } from "./myinfo";
import { Msg } from "./dialog/msg";
import { useHttpClient2 } from 'hooks/http';
import { useToken } from "hooks/store"
import { useUserDB} from 'hooks/db';
import { useQuery } from '@tanstack/react-query'
import { useLocalStorage } from '@mantine/hooks';



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

  const [account] = useLocalStorage({ key: 'savedAccount' })

  const { remainSeconds } = useToken()
  const { http: httpMsg } = useHttpClient2('/rpc/chat/msg/single/');
  const { db, userId, isReady } = useUserDB(account);

  useQuery({
    queryKey: ['poll-message'],
    queryFn: async () => {
      const results = await httpMsg.post('POST')
      const { code, data } = results;
      if (data && code === 200) {
        db.table('message').put({ 'uid': data?.uid, 'msg': data?.msg, 'timestamp': data?.timestamp, 'signal': 'receive' });
        db.table('friends').where('uid').equals(data?.uid).modify((user) => {
          user.signal = 'news';
          user.dialog = 1;
          user.timestamp = data?.timestamp
        });
      }
      return 'ok';
    },
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
  })

  useEffect(() => {
    // console.log('remainSeconds',remainSeconds)
    if (remainSeconds > 0 && remainSeconds < 10) {
      navigate('/user/login/', { replace: true });
    }
  }, [remainSeconds])

  return <Outlet />
}