import React, { useEffect, useMemo, useState } from "react"
import { Outlet, useNavigate } from "react-router";
import { useWinSize, useDateTime, currentAppBar, GlobalAppBar, getUserDB } from 'utils';
import { IconLabel } from 'components';
import { AppShell, Group, Center } from "@mantine/core";
import { IconMessage, IconUsers, IconUser, IconFlask, IconUserCircle } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { userId } from "utils/identity";




export function ChatShell() {
  const navigate = useNavigate();
  const isShowBack = currentAppBar((state) => state.leftPath !== null);


  const { getTimestampMs } = useDateTime();
  const { isMobile } = useWinSize();
  const db = getUserDB(userId.get());

  const [msgDot, setMsgDot] = useState(false);
  const messageChanged = useLiveQuery(async () => {
    if (!db) return;
    return db.table("message").limit(1).toArray();
  }, [db]);
  useEffect(() => {
    if (messageChanged) {
      setMsgDot(true);
    }
  }, [messageChanged]);


  const [gmsgDot, setGmsgDot] = useState(false);
  const gmsgChanged = useLiveQuery(async () => {
    if (!db) return;
    return db.table("groups_dialog").limit(1).toArray();
  }, [db]);
  useEffect(() => {
    if (gmsgChanged) {
      setGmsgDot(true);
    }
  }, [gmsgChanged]);

  const visibleItems = useMemo(() => {
    return [
      { key: 'news', icon: <IconLabel icon={IconMessage} label='消息' onClearBadge={() => setMsgDot(false)} onClick={() => { navigate('/mobile/chat/dialog/') }} dot={msgDot} /> },
      { key: 'friend', icon: <IconLabel icon={IconUser} label='好友' onClick={() => { navigate('/mobile/chat/friend/') }} /> },
      { key: 'group', icon: <IconLabel icon={IconUsers} label='群聊' dot={gmsgDot} onClearBadge={() => setGmsgDot(false)} onClick={() => { navigate('/mobile/chat/group/') }} /> },
      { key: 'self', icon: <IconLabel icon={IconUserCircle} label='我的' onClick={() => { navigate('/mobile/chat/self/'); }} /> },
      { key: 'test', icon: <IconLabel icon={IconFlask} label='测试' onClick={() => { navigate('/mobile/chat/test/test4/'); }} /> },
    ]
  }, [isMobile, navigate, getTimestampMs, msgDot,gmsgDot]);


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
