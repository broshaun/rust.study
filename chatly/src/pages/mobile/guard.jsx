import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Outlet } from 'react-router';
import { useRemainSeconds, getUserDB, createHttpClient, useDateTime, tokenStore } from "utils"
import { invoke, Channel } from "@tauri-apps/api/core";
import { loginCache, } from "cache/loginCache";
import { my_groups } from "cache/my_groups";
import { userId, deviceId } from "utils/identity"



export function ChatGuard() {
  const dt = useDateTime();
  const navigate = useNavigate();
  const db = getUserDB(userId.get());
  const remainSeconds = useRemainSeconds();

  const [mygroup, setMyGroup] = useState(null)
  const [currentUser, setUser] = useState(null)
  useEffect(() => {
    let isMounted = true;

    loginCache.fetch().catch(() => { });
    const unsubscribe1 = loginCache.subscribe((next) => {
      if (!isMounted) return;
      console.log('next++', next)
      setUser(next?.data);
    });

    my_groups.fetch().catch(() => { });
    const unsubscribe = my_groups.subscribe((next) => {
      if (!isMounted) return;
      setMyGroup(next?.data);
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
      unsubscribe1?.();
    }
  }, []);


  const topics = useMemo(() => {
    if (!currentUser?.id || !Array.isArray(mygroup)) return [];
    return [...mygroup.map(item => `chat/group/${item?.id}`), `chat/single/${currentUser.id}`];
  }, [currentUser?.id, mygroup])

  // console.log('mygroup',mygroup)
  // console.log('topics', topics)
  // console.log('currentUser', currentUser)
  // console.log('getUserId', User.get())

  const tokenValue = tokenStore.get()?.token;

  const { http: httpGMsg } = createHttpClient('/rpc/chat/msg/group2/');
  const { http: httpMsg } = createHttpClient('/rpc/chat/msg/single2/');

  useEffect(() => {
    if (!db) return;
    if (!tokenValue) return;

    const channel = new Channel();
    channel.onmessage = async (msg) => {
      console.log("MQTT消息:", msg);
      console.log('msg?.topic', msg?.topic)

      if (msg?.topic.startsWith("chat/single/")) {
        const { type, fromId, messageId } = JSON.parse(msg?.payload || "{}");
        const { code, data } = await httpMsg.requestBodyJson('get_message', { ids: [messageId] })
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
        await db.table('friends_dialog').put({
          id: fromId,
          timestamp: dt.getDateTimeStr(),
          signal: "news",
        });

      } else if (msg?.topic.startsWith("chat/group/")) {
        const { type, groupId, messageId } = JSON.parse(msg?.payload || "{}");
        const { code, data } = await httpGMsg.requestBodyJson('get_message', { ids: [messageId] })
        if (code !== 200) return;
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
        await db.table('gmsgs').bulkPut(messages);
        await db.table('groups_dialog').put({
          id: groupId,
          timestamp: dt.getDateTimeStr(),
          signal: "news",
        });
      }
    };

    let uid = userId.get();
    let did = deviceId.get();

    invoke("subscribe", {
      clientId: `${uid}:${did}`,
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

  useEffect(() => {
    if (!remainSeconds) return;
    if (remainSeconds > 0 && remainSeconds < 10) {
      navigate('/user/login/', { replace: true });
    }
  }, [remainSeconds])

  return <Outlet />
}