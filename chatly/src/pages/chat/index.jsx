import React, { useEffect } from "react";
import { useNavigate, Outlet } from 'react-router';
import { Chat } from "./main";
import { RsFriend } from "./friend";
import { RsDialog } from "./dialog";
import { RsMyInfo } from "./myinfo";
import { Msg } from "./dialog/msg";
import { RsMsgs } from "./messages";

import { useHttpClient2 } from 'hooks/http';
import { useToken } from "hooks/store"
import { useUserDB } from 'hooks/db';
import { useQuery } from '@tanstack/react-query'
import { useLocalStorage } from '@mantine/hooks';

import { Test } from "./test";
// import { PcmTestPage } from "./test2";


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
          ...RsMsgs,
          {
            path: "test",
            element: <Test />,
          }
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
      if (code === 200 && Array.isArray(data) && data.length > 0) {
        // console.log('data....',data)
        await db.transaction('rw', db.message, db.friends, async () => {
          for (const item of data) {
            await db.message.put({
              uid: item.uid,
              msg: item.msg,
              timestamp: item.timestamp,
              signal: 'receive',
            })
            await db.friends
              .where('uid')
              .equals(item.uid)
              .modify((user) => {
                user.signal = 'news'
                user.dialog = 1
                user.timestamp = item.timestamp
              })
          }
        })
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