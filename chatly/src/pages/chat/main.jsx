import React, { useEffect, useMemo, useState } from "react"
import { Outlet, useNavigate } from "react-router";
import { useWinSize, useDateTime } from 'hooks';
import { AppBar, Icon, IconTabler } from 'components/flutter';
import { liveQuery } from 'dexie';
import { useUserDB } from 'hooks/db';
import { useLocalStorage, useDisclosure } from "@mantine/hooks";
import { AppShell, ActionIcon, Stack, Group, Center, Grid, Title, Center } from "@mantine/core";
import { IconMessage, IconUsers, IconUser, IconChevronLeft } from "@tabler/icons-react";



export function Chat() {
  const navigate = useNavigate();

  const [title, setTitle] = useState()
  const [dot, setDot] = useState(false)
  const [account] = useLocalStorage({ key: 'savedAccount' })

  const { getTimestampMs } = useDateTime();
  const { isMobile } = useWinSize();
  const { db } = useUserDB(account);


  const [footerOpened, { toggle }] = useDisclosure(true);




  const items = useMemo(() => {
    return [
      { key: 'message', icon: <IconTabler icon={IconMessage} label='消息' labelPos='bottom' onClick={() => { toggle(); isMobile ? navigate('/chat/message/') : navigate('/chat/message/'); setTitle('消息列表'); setDot(false); }} dot={dot} /> },

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
      footer={{ height: 55, collapsed: !footerOpened }}
    >
      <AppShell.Header>

        <Grid p={15}>
          <Grid.Col span={2}>
            <Center>
              <ActionIcon variant="subtle" color="gray" onClick={() => { navigate('/chat/'); toggle(); }}>
                <IconChevronLeft size={24} />
              </ActionIcon>
            </Center>
          </Grid.Col>
          <Grid.Col span={8}>
            <Center><Title order={5}>{title}</Title></Center>
          </Grid.Col>
        </Grid>

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
