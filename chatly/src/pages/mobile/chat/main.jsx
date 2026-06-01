import React, { useEffect, useMemo, useState } from "react"
import { Outlet, useNavigate } from "react-router";
import { useWinSize, useDateTime, GlobalAppBar, currentAppBar, getUserDB } from 'utils';

import { IconLable } from 'components';
import { liveQuery } from 'dexie';
import { useLocalStorage } from "@mantine/hooks";
import { AppShell, Group, Center } from "@mantine/core";
import { IconMessage, IconUsers, IconUser, IconFlask, IconUserCircle } from "@tabler/icons-react";




export function ChatShell() {
  const navigate = useNavigate();
  const isShowBack = currentAppBar((state) => state.leftPath !== null);

  const [dot, setDot] = useState(false)
  const [account] = useLocalStorage({ key: 'current_account' })
  const { getTimestampMs } = useDateTime();
  const { isMobile } = useWinSize();
  const db = getUserDB(account);

  const items = useMemo(() => {
    return [
      { key: 'news', icon: <IconLable icon={IconMessage} label='消息' labelPos='bottom' onClick={() => { navigate('/mobile/chat/dialog/'); setDot(false); }} dot={dot} /> },
      { key: 'friend', icon: <IconLable icon={IconUser} label='好友' onClick={() => { navigate('/mobile/chat/friend/') }} /> },
      { key: 'group', icon: <IconLable icon={IconUsers} label='群聊' onClick={() => { navigate('/mobile/chat/group/') }} /> },
      { key: 'self', icon: <IconLable icon={IconUserCircle} label='我的' onClick={() => { navigate('/mobile/chat/self/'); }} /> },
    ]
  }, [isMobile, navigate, getTimestampMs, dot]);

  useEffect(() => {
    if (!db) return;
    const sub = liveQuery(
      () => db.table('message').count()
    ).subscribe({
      next: (count) => setDot(count > 0)
    })
    return () => sub.unsubscribe()
  }, [db])

  const visibleItems = items; // 如果有 display: false 的需求，在此过滤

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
