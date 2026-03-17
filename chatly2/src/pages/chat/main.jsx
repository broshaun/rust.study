import React, { useEffect, useMemo, useState } from "react"
import { Outlet, useNavigate } from "react-router";
import { useWinSize, useDateTime } from 'hooks';
import { AppShell, AppBar, PCShell, Icon, XBox, YBox } from 'components/flutter';
import { liveQuery } from 'dexie';
import { db } from 'hooks/db';


export function Chat() {
  const navigate = useNavigate();
  const { getTimestampMs } = useDateTime();
  const { isMobile } = useWinSize();
  const [title, setTitle ] = useState()
  const [dot, setDot] = useState(false)

  const items = useMemo(() => {
    return [
      { key: 'news', icon: <Icon name="chat-bubble-bottom-center-text" label='消息' onClick={() => { isMobile ? navigate('/chat/mobile/dialog/') : navigate('/chat/dialog/'); setTitle('消息列表'); setDot(false) }} dot={dot} /> },
      { key: 'friend', icon: <Icon name="users_oline" label='好友' onClick={() => { isMobile ? navigate('/chat/mobile/friend/') : navigate('/chat/friend/'); setTitle('好友列表'); }} /> },
      { key: 'self', icon: <Icon name="user-oouline" label='我的' onClick={() => { navigate('/chat/self/mylist/', { state: getTimestampMs() }); setTitle('我的信息'); }} /> },
    ]
  }, [isMobile, navigate, getTimestampMs, dot]);


  useEffect(() => {
    const sub = liveQuery(
      () => db.table('message').count()
    ).subscribe({
      next: (count) => setDot(count > 0)
    })
    return () => sub.unsubscribe()
  }, [])



  const visibleItems = items; // 如果有 display: false 的需求，在此过滤
  // --- PC 端布局 ---
  if (!isMobile) {
    return (
      <PCShell>
        <PCShell.Left width={80}>
          <YBox gap={10} padding={25}>
            {
              visibleItems.map((item) => <div key={item.key}>{item.icon}</div>)
            }
          </YBox>
        </PCShell.Left>
        <PCShell.Content>
          <Outlet />
        </PCShell.Content>
      </PCShell>
    );
  }

  // --- 移动端布局 ---
  return (
    <AppShell>
      <AppShell.Header>
        <AppBar title={title} />
      </AppShell.Header>

      <AppShell.Content>

        <Outlet />
      </AppShell.Content>

      <AppShell.Footer height={70}>
        <XBox>
          {
            visibleItems.map((item) => <XBox.Segment key={item.key}>{item.icon}</XBox.Segment>)
          }
        </XBox>

      </AppShell.Footer>
    </AppShell>
  );
}
