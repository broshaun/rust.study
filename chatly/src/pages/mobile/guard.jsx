import React, { useEffect } from "react";
import { useNavigate, Outlet } from 'react-router';
import { useRemainSeconds, getUserDB, useHttpClient, useDateTime } from "utils"
import { useQuery } from '@tanstack/react-query'
import { useLocalStorage } from '@mantine/hooks';
import { currentAwait } from "utils";


export function ChatGuard() {
  const dt = useDateTime();
  const navigate = useNavigate();
  const [userId] = useLocalStorage({ key: 'current_account' })
  const db = getUserDB(userId);
  const remainSeconds = useRemainSeconds();


  const { http: httpAwait } = useHttpClient("/rpc/chat/friend/");
  const { data: friendsAwait = [], isFetching } = useQuery({
    queryKey: ["friends-await", userId],
    queryFn: async () => {
      const res = await httpAwait.requestBodyJson("get_await_friends", {}).catch(console.error);
      return res?.code === 200 ? res.data ?? [] : [];
    },
    staleTime: 3000,
    gcTime: 1000 * 60 * 5,
    refetchInterval: 3000,
    enabled: Boolean(userId),
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    currentAwait.getState().set("friend", friendsAwait.length);
  }, [friendsAwait.length]);


  const { http: httpGMsg } = useHttpClient('/rpc/chat/msg/group/');
  const fetchGroupMsgs = async () => {
    const { code, data } = await httpGMsg.requestBodyJson("group_receive");
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

        await db.table('groups_dialog').put({
          id: item.group_id,
          timestamp: dt.getDateTimeStr(),
          signal: "news",
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
      await db.table('friends_dialog').put({
        id: item.uid,
        timestamp: dt.getDateTimeStr(),
        signal: "news",
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