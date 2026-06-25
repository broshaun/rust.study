import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Outlet } from 'react-router';
import { useRemainSeconds, getUserDB, createHttpClient, useDateTime } from "utils"
import { useLocalStorage } from '@mantine/hooks';
import { currentAwait, tokenStore } from "utils";
import { afriends } from "cache/friendsAwait";
import { invoke, Channel } from "@tauri-apps/api/core";
import { loginCache, } from "cache/loginCache";
import { my_groups } from "cache/my_groups";
import { User, Device } from "utils/identity"



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

  const currentUser = loginCache.get()


  useEffect(() => {
    loginCache.refresh().catch(() => { })
  }, [userId])

  const [mygroup, setMyGroup] = useState(null)
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    my_groups.fetch().catch(() => { });
    const unsubscribe = my_groups.subscribe((next) => {
      if (!isMounted) return;
      setMyGroup(next?.data);
    });
    return () => {
      isMounted = false;
      unsubscribe?.();
    }
  }, [userId]);


  const topics = useMemo(() => {
    if (!currentUser?.id || !Array.isArray(mygroup)) return [];

    return [...mygroup.map(item => `chat/group/${item?.id}`), `chat/single/${currentUser.id}`];
  }, [currentUser?.id, mygroup])



  console.log('topics', topics)
  console.log('currentUser', currentUser)
  console.log('getDeviceId',Device.get())
  console.log('getUserId', User.get())


  const tokenValue = tokenStore.get()?.token;


  const { http: httpGMsg } = createHttpClient('/rpc/chat/msg/group2/');
  const { http: httpMsg } = createHttpClient('/rpc/chat/msg/single2/');


  useEffect(() => {
    if (!db) return;
    if (!userId) return;
    if (!tokenValue) return;
    const channel = new Channel();
    channel.onmessage = async (msg) => {
      console.log("MQTT消息:", msg);
      const { topic, payload } = msg
      if (!topic || !payload) return;

      if (topic.startsWith("chat/single/")) {
        const { code, data } = await httpMsg.requestBodyJson('get_message', { ids: [payload] })
        if (code !== 200) return;
        const messages = data.map(item => ({
          id: item.id,
          avatar_url: item.avatar_url,
          uid: item.user_id,
          type: item.msg_type,
          content: item.msg_text,
          timestamp: item.created_at,
          sentByMe: false,
        }));
        await db.table('message').bulkPut(messages);

      } else if (topic.startsWith("chat/group/")) {




        const { code, data } = await httpGMsg.requestBodyJson('get_message', { ids: [payload] })
        if (code !== 200) return;



        console.log('data', data)

        const messages = data.map(item => ({
          id: item.id,
          avatar_url: item.avatar_url,
          group_id: item.group_id,
          nickname: item.nickname,
          type: item.msg_type,
          content: item.msg_text,
          timestamp: item.created_at,
          sentByMe: item.sentByMe,
        }));

        console.log('messages', messages)

        await db.table('gmsgs').bulkPut(messages);

      }
    };




    invoke("subscribe", {
      clientId: "77254254",
      host: "192.168.2.1",
      port: 1883,
      username: "jwt",
      password: tokenValue,
      topics: topics,
      onMessage: channel,
    }).catch((err) => { console.error("MQTT订阅失败:", err); });

    return () => {
      invoke("unsubscribe").catch((err) => {
        console.error("MQTT停止失败:", err);
      });
    };
  }, [tokenValue, topics, db])






  // [Log] MQTT消息: – {topic: "chat/single/6a1678614ad4463c12acf445", payload: "6a3bdc547674eb3fee46d849"} (index.ac15a4feb0bbb688.hot-update.js, line 80)

  // const { http: httpGMsg } = createHttpClient('/rpc/chat/msg/group/');
  // const fetchGroupMsgs = async () => {
  //   const { code, data } = await httpGMsg.requestBodyJson("group_receive");
  //   if (code !== 200 || !data?.length) return;
  //   await Promise.all(
  //     data.map(async (item) => {
  //       await db.table('gmsgs').put({
  //         id: item.id,
  //         avatar_url: item.avatar_url,
  //         nickname: item.nickname,
  //         type: item.msg_type,
  //         content: item.msg_text,
  //         timestamp: item.timestamp,
  //         sentByMe: false,
  //         group_id: item.group_id,

  //       });

  //       await db.table('groups_dialog').put({
  //         id: item.group_id,
  //         timestamp: dt.getDateTimeStr(),
  //         signal: "news",
  //       });
  //     })
  //   );
  // };

  // const { http: httpMsg } = createHttpClient('/rpc/chat/msg/single/');
  // const fetchMsgs = async () => {
  //   const { code, data } = await httpMsg.requestBodyJson('POST')
  //   if (code !== 200 || !data?.length) return;

  //   await Promise.all(data.map(async (item) => {
  //     await db.table('message').put({
  //       avatar_url: item.avatar_url,
  //       nickname: item.nickname,
  //       uid: item.uid,
  //       type: item.msg_type,
  //       content: item.msg_text,
  //       timestamp: item.timestamp,
  //       sentByMe: false,
  //     });
  //     await db.table('friends_dialog').put({
  //       id: item.uid,
  //       timestamp: dt.getDateTimeStr(),
  //       signal: "news",
  //     });
  //   }));
  // }

  // useEffect(() => {
  //   if (!userId) return;
  //   const timer = setInterval(async () => {
  //     await fetchMsgs();
  //     await fetchGroupMsgs();
  //   }, 2000);
  //   return () => clearInterval(timer);
  // }, [userId]);

  useEffect(() => {
    if (remainSeconds > 0 && remainSeconds < 10) {
      navigate('/user/login/', { replace: true });
    }
  }, [remainSeconds])

  return <Outlet />
}