import React, { useEffect,useMemo } from "react";
import { useNavigate, Outlet } from 'react-router';
import { useToken, getUserDB, useHttpClient } from "utils"
import { useQuery } from '@tanstack/react-query'
import { useLocalStorage } from '@mantine/hooks';




export function ChatGuard() {
  const navigate = useNavigate();

  const [userId] = useLocalStorage({ key: 'savedAccount' })
  const  db = getUserDB(userId);
  
  const { remainSeconds } = useToken()
  const { http: httpMsg } = useHttpClient('/rpc/chat/msg/single/');
  



  useQuery({
    queryKey: ['poll-message'],
    queryFn: async () => {
      const results = await httpMsg.post('POST')
      const { code, data } = results;
      if (code === 200 && Array.isArray(data) && data.length > 0) {
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