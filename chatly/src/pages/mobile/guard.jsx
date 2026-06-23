import React, { useEffect } from "react";
import { useNavigate, Outlet } from 'react-router';
import { useRemainSeconds, getUserDB, createHttpClient, useDateTime } from "utils"
import { useLocalStorage } from '@mantine/hooks';
import { currentAwait, tokenStore } from "utils";
import { afriends } from "cache/friendsAwait";
import { invoke, Channel } from "@tauri-apps/api/core";

export function ChatGuard() {
  const dt = useDateTime();
  const navigate = useNavigate();
  const [userId] = useLocalStorage({ key: 'current_account' })
  const db = getUserDB(userId);
  const remainSeconds = useRemainSeconds();

  // afriends.fetch(userId).then((list) => {
  //   if (list !== null) {
  //     currentAwait.getState().set("friend", list.length);
  //   }
  // });
  const tokenValue = tokenStore.get()?.token;

  // console.log('tokenValue', tokenValue)

  // invoke('spawn_demo_task', { name: 'task01', interval_secs: 100 }).catch(console.error)

  // invoke('list_tasks').catch(console.error)


  // useEffect(() => {
  //   const channel = new Channel();
  //   channel.onmessage = (msg) => {
  //     console.log("MQTT消息:", msg);
  //   };
  //   invoke("mqtt_subscribe", {
  //     clientId: "tauri-user-001",
  //     host: "192.168.2.1",
  //     port: 1883,
  //     username: "jwt",
  //     password: tokenValue,
  //     topic: "chat/single/001",
  //     onMessage: channel,
  //   }).catch((err) => { console.error("MQTT订阅失败:", err); });
  //   return ()=>{

  //   }
  // }, [tokenValue])


  const { http: httpGMsg } = createHttpClient('/rpc/chat/msg/group/');
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

  const { http: httpMsg } = createHttpClient('/rpc/chat/msg/single/');
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

  useEffect(() => {
    if (!userId) return;
    const timer = setInterval(async () => {
      await fetchMsgs();
      await fetchGroupMsgs();
    }, 2000);
    return () => clearInterval(timer);
  }, [userId]);

  useEffect(() => {
    if (remainSeconds > 0 && remainSeconds < 10) {
      navigate('/user/login/', { replace: true });
    }
  }, [remainSeconds])

  return <Outlet />
}