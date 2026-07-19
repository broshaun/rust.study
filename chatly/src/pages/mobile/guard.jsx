import React, { useEffect, useMemo } from "react";
import { useNavigate, Outlet, useLoaderData } from 'react-router';
import { createHttpClient, useDateTime, useRemainSeconds } from "utils"
import { invoke, Channel } from "@tauri-apps/api/core";
import { useSet, useRequest, useUpdateEffect } from "ahooks";
import { ObjectId } from "bson";
import { friend_await_message } from "cache/friend_await_message";
import { group_invite_msg } from "cache/group_invite_msg";
import { userId, deviceId } from "utils/identity"
import { apiMqtt } from "utils/store/apiBase";
import { tokenStore, getUserDB } from "utils";
import { loginCache2 } from "cache/loginCache";
import { group_list2 } from "cache/group_list";
import { useLiveQuery } from "dexie-react-hooks";




export const chatGuardLoader = async () => {
  const uid = userId.get();
  const did = deviceId.get();
  const host = apiMqtt.get();
  const token = tokenStore.get()?.token;
  if (!uid || !did || !host || !token) {
    return redirect("/mobile/auth/user");
  }
  const db = getUserDB(uid)
  await group_list2.fetch();
  const currentUser = await loginCache2.fetch();
  return { uid, did, host, token, db, currentUser };
};

export function ChatGuard() {
  const navigate = useNavigate();

  const { uid, did, host, token, db, currentUser } = useLoaderData();
  const dt = useDateTime();
  const remainSeconds = useRemainSeconds();

  const initialTopcs = useMemo(() => {
    return [`chat/single/${currentUser?.id}`]
  }, [currentUser?.id])

  const [topics, { add, reset }] = useSet(initialTopcs);
  useLiveQuery(async () => {
    if (!db) return;
    reset();
    const { data: groups = [] } = await db.cache.get('my_group_list');
    groups.forEach(item => add(`chat/group/${item?.id}`));
  }, [db])

  // console.log('topics++', topics)

  // 单聊离线消息
  const { http: httpMsg } = createHttpClient('/rpc/chat/msg/single2/');
  useRequest(
    async () => {
      const maxItem = await db.table('message').orderBy('id').last()
      let last_id = maxItem?.id
      if (!last_id) {
        const oneWeekAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const timestampSec = Math.floor(oneWeekAgoMs / 1000);
        last_id = ObjectId.createFromTime(timestampSec).toString();
      }
      const { code, message, data } = await httpMsg.requestBodyJson('get_after_messges', { last_id })
      if (code !== 200) throw new Error(message);
      const messages = data.map(item => ({
        id: item.id,
        avatar_url: item.avatar_url,
        uid: item.user_id,
        type: item.msg_type,
        content: item.msg_text,
        timestamp: item.created_at,
        sentByMe: item.sentByMe,
      }));
      return messages
    },
    {
      manual: false,
      onSuccess: async (messages) => {
        messages.forEach(async (msg) => {
          await db.table('message').put(msg)
          await db.table('friends_dialog').put({ id: msg.uid, timestamp: dt.getDateTimeStr(), signal: "news" });
        })
      }
    }
  )

  // 群聊离线消息
  const { http: httpGMsg } = createHttpClient('/rpc/chat/msg/group2/');
  useRequest(
    async () => {
      const maxItem = await db.table('gmsgs').orderBy('id').last()
      let last_id = maxItem?.id
      if (!last_id) {
        const oneWeekAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const timestampSec = Math.floor(oneWeekAgoMs / 1000);
        last_id = ObjectId.createFromTime(timestampSec).toString();
      }

      const { code, message, data } = await httpGMsg.requestBodyJson('get_after_messges', { last_id })
      if (code !== 200) throw new Error(message);
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
      return messages
    },
    {
      manual: false,
      onSuccess: async (messages) => {
        messages.forEach(async (msg) => {
          await db.table('gmsgs').put(msg)
          await db.table('groups_dialog').put({ id: msg?.group_id, timestamp: dt.getDateTimeStr(), signal: "news" });
        })
      }
    })

  // 获取朋友消息
  const { runAsync: getFriendMessage } = useRequest(
    async (messageId) => {
      const { code, message, data } = await httpMsg.requestBodyJson('get_message', { ids: [messageId] })
      if (code !== 200) throw new Error(message);
      const messages = data.map(item => ({
        id: item.id,
        avatar_url: item.avatar_url,
        uid: item.user_id,
        type: item.msg_type,
        content: item.msg_text,
        timestamp: item.created_at,
        sentByMe: false,
      }));
      return messages
    },
    {
      manual: true,
      onSuccess: async (messages) => {
        messages.forEach(async (msg) => {
          await db.table('message').put(msg);
          await db.table('friends_dialog').put({ id: msg.uid, timestamp: dt.getDateTimeStr(), signal: "news" });
        })
      },
      onError: async (error) => {
        console.error(error)
      }
    }
  )

  // 获取群消息
  const { runAsync: getGroupMessage } = useRequest(
    async (messageId) => {
      const { code, message, data } = await httpGMsg.requestBodyJson('get_message', { ids: [messageId] })
      if (code !== 200) throw new Error(message);
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
      return messages
    },
    {
      manual: true,
      onSuccess: async (messages) => {
        messages.forEach(async (msg) => {
          await db.table('gmsgs').put(msg);
          await db.table('groups_dialog').put({ id: msg?.group_id, timestamp: dt.getDateTimeStr(), signal: "news" });
        })
      },
      onError: async (error) => {
        console.error(error)
      }
    }
  )

  useEffect(() => {
    // if (loading) return;
    if (!uid && !did && !host && !token) return;
    if (!topics) return;

    const channel = new Channel();
    channel.onmessage = async (msg) => {
      console.log("MQTT消息:", msg);

      if (msg?.topic.startsWith("chat/single/")) {
        const { type, fromId, messageId } = JSON.parse(msg?.payload)
        if (type === 'single') {
          await getFriendMessage(messageId);
        }
        else if (type === 'add_friend') {
          await friend_await_message.refresh();
        }

      } else if (msg?.topic.startsWith("chat/group/")) {
        const { type, groupId, messageId } = JSON.parse(msg?.payload)
        if (type === 'group') {
          await getGroupMessage(messageId);
        }
        else if (type === 'invite_members') {
          await group_invite_msg.refresh()
        }
      }
    };

    console.log("clientId:" ,`${uid}:${did}`)
    console.log("host:" ,`${host}`)
    console.log("password:", token)
    console.log("topics:" ,Array.from(topics))

    
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
  }, [topics, uid, did, host, token])

  useUpdateEffect(() => {
    if (remainSeconds > 0 && remainSeconds < 10) navigate('/mobile/auth/user/', { replace: true });
  }, [remainSeconds])


  return <Outlet />
}



