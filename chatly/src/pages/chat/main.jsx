import React, { useEffect, useMemo, useState } from "react"
import { Outlet, useNavigate } from "react-router";
import { useWinSize, useDateTime } from 'hooks';
import { AppBar, Icon, IconTabler } from 'components/flutter';
import { liveQuery } from 'dexie';
import { useUserDB } from 'hooks/db';
import { useLocalStorage } from "@mantine/hooks";
import { AppShell, Stack, Group, Center } from "@mantine/core";
import { IconMessage, IconUsers, IconUser } from "@tabler/icons-react";



export function Chat() {
  const navigate = useNavigate();

  const [title, setTitle] = useState()
  const [dot, setDot] = useState(false)
  const [account] = useLocalStorage({ key: 'savedAccount' })

  const { getTimestampMs } = useDateTime();
  const { isMobile } = useWinSize();
  const { db, userId, isReady } = useUserDB(account);

  const items = useMemo(() => {
    return [
      { key: 'news', icon: <IconTabler icon={IconMessage} label='消息' labelPos='bottom' onClick={() => { isMobile ? navigate('/chat/mobile/dialog/') : navigate('/chat/dialog/'); setTitle('消息列表'); setDot(false); }} dot={dot} /> },
      { key: 'friend', icon: <IconTabler icon={IconUsers} label='好友' onClick={() => { isMobile ? navigate('/chat/mobile/friend/') : navigate('/chat/friend/'); setTitle('好友列表'); }} /> },
      { key: 'self', icon: <IconTabler icon={IconUser} label='我的' onClick={() => { navigate('/chat/self/mylist/', { state: getTimestampMs() }); setTitle('我的信息'); }} /> },
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


  // --- PC 端布局 ---
  if (!isMobile) {
    return (
      <AppShell navbar={{ width: 65 }}>
        <AppShell.Navbar >
          <Stack gap={25} p={25} align="center">
            {
              visibleItems.map((item) => <div key={item.key}>{item.icon}</div>)
            }
          </Stack>
        </AppShell.Navbar>
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    );
  }

  // --- 移动端布局 ---
  return (
    <AppShell
      padding={0}
      header={{ height: 55 }}
      footer={{ height: 55 }}
    >
      <AppShell.Header>
        <AppBar title={title} />
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
