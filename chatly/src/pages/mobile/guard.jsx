import React, { useEffect } from "react";
import { useNavigate, Outlet } from 'react-router';
import { useToken, getUserDB, useHttpClient, useDateTime, groupStore } from "utils"
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
    const results = await httpGMsg.requestBodyJson('group_receive')
    const { code, data } = results;
    if (code === 200 && Array.isArray(data) && data.length > 0) {
      await db.table('gmsgs').bulkPut(
        data.map((item) => ({
          avatar_url: item.avatar_url,
          nickname: item.nickname,
          type: item.msg_type,
          content: item.msg_text,
          timestamp: item.timestamp,
          sentByMe: false,
          group_id: item.group_id,
        }))
      );

      const groupMsgCount = {};
      data.forEach(item => {
        const groupId = item.group_id;
        groupMsgCount[groupId] = (groupMsgCount[groupId] || 0) + 1;
      });
      Object.entries(groupMsgCount).forEach(([group_id, count]) => {
        const oldStore = groupStore.getState().get(group_id) || {};
        const newUnread = (oldStore.unread || 0) + count;
        groupStore.getState().set(group_id, {
          ...oldStore,
          unread: newUnread,
          signal: "news",
          timestamp: dt.getDateTimeStr(),
        });
      });
    }
  }

  const { http: httpMsg } = useHttpClient('/rpc/chat/msg/single/');
  const fetchMsgs = async () => {
    const results = await httpMsg.requestBodyJson('POST')
    const { code, data } = results;
    if (code === 200 && Array.isArray(data) && data.length > 0) {

      await db.table('message').bulkPut(
        data.map((item) => ({
          avatar_url: item.avatar_url,
          nickname: item.nickname,
          uid: item.uid,
          type: item.msg_type,
          content: item.msg_text,
          timestamp: item.timestamp,
          sentByMe: false,
        }))
      );

      await Promise.all(
        data.map((item) =>
          db.table('friends')
            .where('uid')
            .equals(item.uid)
            .modify((user) => {
              user.signal = 'news';
              user.dialog = 1;
              user.timestamp = item.timestamp;
            })
        )
      );
    }
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