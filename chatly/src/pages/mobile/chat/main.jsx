import React, { useEffect, useMemo, useState } from "react"
import { Outlet, useNavigate, useLoaderData,useLocation } from "react-router";
import { useWinSize, useDateTime, currentAppBar, GlobalAppBar } from 'utils';
import { IconLabel } from 'components';
import { AppShell, Group, Center } from "@mantine/core";
import { IconMessage, IconUsers, IconUser, IconUserCircle } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useUpdateEffect } from "ahooks";
import { friend_await_message } from "cache/friend_await_message";
import { group_invite_msg } from "cache/group_invite_msg";



export function ChatShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const readyData = useLoaderData();
  const db = readyData?.db;
  const isShowBack = currentAppBar((state) => state.leftPath !== null);

  const { getTimestampMs } = useDateTime();
  const { isMobile } = useWinSize();

  // 好友消息图标提示
  const [msgDot, setMsgDot] = useState(false);
  const messageCount = useLiveQuery(async () => await db.table("message").count(), [db]);
  useUpdateEffect(() => {
    if (!messageCount || location.pathname.startsWith('/mobile/chat/message')) return;
      setMsgDot(true)
  }, [messageCount])

  // 群消息图标提示
  const [gmsgDot, setGmsgDot] = useState(false);
  const gmsgCount = useLiveQuery(async () => await db.table("gmsgs").count(), [db]);
  useUpdateEffect(() => {
    if (!gmsgCount || location.pathname.startsWith('/mobile/chat/group')) return;
    setGmsgDot(true)
  }, [gmsgCount])
  // 群邀请消息图标提示
  useEffect(() => {
    group_invite_msg.subscribe((state) => {
      if (!state.isSuccess) return;
      const isInvite = state.data.some(({ ask_state = [] }) => (ask_state?.includes("invite") && !ask_state?.includes("agreed")))
      if (isInvite) {
        setGmsgDot(true)
      }
    })
  }, [])

  // 好友请求消息图标提示
  const [friendDot, setFriendDot] = useState(false);
  useEffect(() => {
    const unsubscribe = friend_await_message.subscribe((state) => {
      if (!state.isSuccess) return;
      const isInvite = state.data.some(({ ask_state = [] }) => (ask_state?.includes("await") && !ask_state?.includes("agree")))
      if (isInvite) {
        setFriendDot(true)
      }
    })
    return unsubscribe;
  }, [])



  const visibleItems = useMemo(() => {
    return [
      { key: 'news', icon: <IconLabel icon={IconMessage} label='消息' dot={msgDot} onClearBadge={() => setMsgDot(false)} onClick={() => { navigate('/mobile/chat/dialog/') }} /> },
      { key: 'friend', icon: <IconLabel icon={IconUser} label='好友' dot={friendDot} onClearBadge={() => setFriendDot(false)} onClick={() => { navigate('/mobile/chat/friend/') }} /> },
      { key: 'group', icon: <IconLabel icon={IconUsers} label='群聊' dot={gmsgDot} onClearBadge={() => setGmsgDot(false)} onClick={() => { navigate('/mobile/chat/group/') }} /> },
      { key: 'self', icon: <IconLabel icon={IconUserCircle} label='我的' onClick={() => { navigate('/mobile/chat/self/'); }} /> },
      // { key: 'test', icon: <IconLabel icon={IconFlask} label='测试' onClick={() => { navigate('/mobile/chat/test/test4/'); }} /> },
    ]
  }, [isMobile, navigate, getTimestampMs, msgDot, gmsgDot, friendDot]);


  return (
    <AppShell
      padding={0}
      header={{ height: 55 }}
      footer={{ height: 55, collapsed: isShowBack }}
      transitionDuration={0}
    >
      <AppShell.Header>
        <GlobalAppBar />
      </AppShell.Header>
      <AppShell.Main>

        <Outlet />

      </AppShell.Main>
      <AppShell.Footer>
        <Group h="100%" grow gap={1} >
          {
            visibleItems.map((item) => <Center key={item.key}>{item.icon}</Center>)
          }
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
