import React, { useEffect } from "react";
import { useNavigate, Outlet } from 'react-router';
import { useToken, getUserDB, useHttpClient, useDateTime } from "utils"
import { useQuery } from '@tanstack/react-query'
import { useLocalStorage } from '@mantine/hooks';


export function ChatGuard() {
  const dt = useDateTime();
  const navigate = useNavigate();
  const [userId] = useLocalStorage({ key: 'current_account' })
  const db = getUserDB(userId);
  const { remainSeconds } = useToken()


  const { http: httpGMsg } = useHttpClient('/rpc/chat/msg/group/');
  const fetchGroupMsgs = async () => {
    const { code, data } = await httpGMsg.requestBodyJson("group_receive");
    // console.log('data',data);
    if (code !== 200 || !data?.length) return;
    await Promise.all(
      data.map(async (item) => {
        await db.table('gmsgs').put({
          id: item.id,
          avatar_url: item.avatar_url,
          nickname: item.nickname,
          type: item.msg_type,
          content: item.msg_text,
          timestamp: item.timestamp,
          sentByMe: false,
          group_id: item.group_id,
        });

        // const dialog = await db.table('groups_dialog').get(item.id);
        await db.table('groups_dialog').put({
          id: item.group_id,
          timestamp: dt.getDateTimeStr(),
          signal: "news",
          // unread: (dialog?.unread ?? 0) + 1,
        });
      })
    );
  };

  const { http: httpMsg } = useHttpClient('/rpc/chat/msg/single/');
  const fetchMsgs = async () => {
    const { code, data } = await httpMsg.requestBodyJson('POST')
    if (code !== 200 || !data?.length) return;

    await Promise.all(data.map(async (item) => {
      await db.table('message').put({
        avatar_url: item.avatar_url,
        nickname: item.nickname,
        uid: item.uid,
        type: item.msg_type,
        content: item.msg_text,
        timestamp: item.timestamp,
        sentByMe: false,
      });

      // const dialog = await db.table('friends_dialog').get(item.uid);
      await db.table('friends_dialog').put({
        id: item.uid,
        timestamp: dt.getDateTimeStr(),
        signal: "news",
        // unread: (dialog?.unread ?? 0) + 1,
      });
    }));
  }

  // 每2秒获取一次
  useQuery({
    queryKey: ['poll-message'],
    queryFn: async () => {
      await fetchMsgs();
      await fetchGroupMsgs();
      return 'ok';
    },
    enabled: !!userId,
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
  })

  useEffect(() => {
    if (remainSeconds > 0 && remainSeconds < 10) {
      navigate('/user/login/', { replace: true });
    }
  }, [remainSeconds])

  return <Outlet />
}