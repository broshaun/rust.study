import React, { useEffect } from "react";
import { useNavigate, Outlet, useLoaderData } from 'react-router';
import { createHttpClient, useDateTime, useRemainSeconds } from "utils"
import { invoke, Channel } from "@tauri-apps/api/core";
import { useSet, useUpdateEffect } from "ahooks";
import { loginCache, } from "cache/loginCache";
import { group_list } from "cache/group_list";
import { ObjectId } from "bson";



export function ChatGuard() {
  const navigate = useNavigate();
  const readyData = useLoaderData();
  const dt = useDateTime();
  const db = readyData?.db;
  const remainSeconds = useRemainSeconds();

  // ++++ 订阅列表 ++++
  const currentUser = loginCache.get()
  const [topics, { add, remove, reset }] = useSet([`chat/single/${currentUser.id}`]);
  useEffect(() => {
    const unsubscribe = group_list.subscribe((next) => {
      if (!next?.isSuccess) return;
      reset();
      next?.data?.forEach(item => add(`chat/group/${item?.id}`));
    });
    return () => unsubscribe;
  }, []);

  console.log('topics++', topics)
  console.log('Array.from(topics)++', Array.from(topics))

  // 单聊离线消息
  const { http: httpMsg } = createHttpClient('/rpc/chat/msg/single2/');
  const after_friend_message = async () => {
    const maxItem = await db.table('message').orderBy('id').last()
    let last_id = maxItem?.id
    if (!last_id) {
      const oneWeekAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const timestampSec = Math.floor(oneWeekAgoMs / 1000);
      last_id = ObjectId.createFromTime(timestampSec).toString();
    }
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

  // 群聊离线消息
  const { http: httpGMsg } = createHttpClient('/rpc/chat/msg/group2/');
  const after_group_message = async () => {
    const maxItem = await db.table('message').orderBy('id').last()
    let last_id = maxItem?.id
    if (!last_id) {
      const oneWeekAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const timestampSec = Math.floor(oneWeekAgoMs / 1000);
      last_id = ObjectId.createFromTime(timestampSec).toString();
    }
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

  useEffect(() => {
    if (!readyData) return;
    if (!topics)return;

    after_friend_message().catch(console.error);
    after_group_message().catch(console.error);

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
        await db.table('friends_dialog').put({ id: fromId, timestamp: dt.getDateTimeStr(), signal: "news" });

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
        await db.table('groups_dialog').put({ id: groupId, timestamp: dt.getDateTimeStr(), signal: "news" });
      }
    };

    const { uid, did, host, token } = readyData;
    invoke("subscribe", {
      clientId: `${uid}:${did}`,
      host: host,
      port: 1883,
      username: "jwt",
      password: token,
      topics: Array.from(topics),
      onMessage: channel,
    }).catch(console.error)


    return () => {
      invoke("unsubscribe").catch(console.error);
    }
  }, [topics, readyData])

  useUpdateEffect(() => {
    if (remainSeconds > 0 && remainSeconds < 10) navigate('/mobile/auth/user/', { replace: true });
  }, [remainSeconds])


  return <Outlet />
}



