import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Outlet ,useLoaderData} from 'react-router';
import { createHttpClient, useDateTime, useRemainSeconds } from "utils"
import { invoke, Channel } from "@tauri-apps/api/core";
import { loginCache, } from "cache/loginCache";
import { my_groups } from "cache/my_groups";



export function ChatGuard() {
  const navigate = useNavigate();
  const readyData = useLoaderData();
  const dt = useDateTime();
  const db = readyData?.db;
  const remainSeconds = useRemainSeconds();

  // ++++ 订阅列表 ++++
  const [mygroup, setMyGroup] = useState(null)
  const [currentUser, setUser] = useState(null)
  useEffect(() => {
    let isMounted = true;
    loginCache.fetch().catch(() => { });
    const unsubscribe1 = loginCache.subscribe((next) => {
      if (!isMounted) return;
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

  const { http: httpGMsg } = createHttpClient('/rpc/chat/msg/group2/');
  const { http: httpMsg } = createHttpClient('/rpc/chat/msg/single2/');

  // 离线消息
  const get_after_message = () => {
    const after_friend_message = async () => {
      const maxItem = await db.table('message').orderBy('id').last()
      let last_id = maxItem?.id
      if (!last_id) last_id = '000000000000000000000000';
      const { code, data } = await httpMsg.requestBodyJson('get_after_messges', { last_id })
      if (code === 200) {
        const messages = data.map(item => ({
          id: item.id,
          avatar_url: item.avatar_url,
          uid: item.user_id,
          type: item.msg_type,
          content: item.msg_text,
          timestamp: item.created_at,
          sentByMe: item.sentByMe,
        }));
        await db.table('message').bulkPut(messages)
      }
    }

    const after_group_message = async () => {
      const maxItem = await db.table('message').orderBy('id').last()
      let last_id = maxItem?.id
      if (!last_id) last_id = '000000000000000000000000';
      const { code, data } = await httpGMsg.requestBodyJson('get_after_messges', { last_id })
      if (code === 200) {
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
        await db.table('gmsgs').bulkPut(messages)
      }
    }

    after_friend_message().catch(console.error)
    after_group_message().catch(console.error)

  }





  useEffect(() => {
    if (!readyData) return;


    get_after_message() // 离线消息加载

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

    const { uid, did, host, token } = readyData;

    invoke("subscribe", {
      clientId: `${uid}:${did}`,
      host: host,
      port: 1883,
      username: "jwt",
      password: token,
      topics: topics,
      onMessage: channel,
    }).catch((err) => { console.error("MQTT订阅失败:", err); });

    return () => {
      invoke("unsubscribe").catch((err) => {
        console.error("MQTT停止失败:", err);
      });
    };
  }, [topics, readyData])

  useEffect(() => {
    if (!remainSeconds) return;
    if (remainSeconds > 0 && remainSeconds < 10) {
      navigate('/user/login/', { replace: true });
    }
  }, [remainSeconds])

  return <Outlet />
}



