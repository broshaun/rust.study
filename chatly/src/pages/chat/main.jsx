import React, { useState, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useWinWidth, useHttpClient, useDateTime } from 'hooks';
import { useRequest } from 'ahooks';
import { db } from 'hooks/db';
import { AppShell, AppBar, DesktopShell, Row, Padding, Icon, Center, ListView, SizedBox } from 'components/flutter';

export function Chat() {
  const navigate = useNavigate();
  const location = useLocation(); // 获取当前路径用于判断 Active 状态
  const { getTimestampMs } = useDateTime();
  const { http: httpMsg } = useHttpClient('/api/chat/msg/single/');
  const { isMobile } = useWinWidth();
  const [title, setTitle] = useState('Chatly');

  // 1. 消息轮询逻辑 (保持不变)
  useRequest(() => {
    httpMsg.requestParams('POST').then((results) => {
      if (!results) return;
      const { code, data } = results;
      if (data && code === 200) {
        db.table('message').put({ 'uid': data?.uid, 'msg': data?.msg, 'timestamp': data?.timestamp, 'signal': 'receive' });
        db.table('friends').where('uid').equals(data?.uid).modify((user) => {
          user.signal = 'news';
          user.dialog = 1;
        });
      }
    });
    return 'ok';
  }, { pollingInterval: 1000, pollingWhenHidden: false });

  // 2. 菜单定义 (抽离逻辑，增加路径判断)
  const items = useMemo(() => [
    {
      key: 'self',
      path: '/chat/self/mylist/',
      icon: { name: 'user-oouline', label: '我的' },
      onClick: () => { navigate('/chat/self/mylist/', { state: getTimestampMs() }); setTitle('我的信息'); }
    },
    {
      key: 'friend',
      path: isMobile ? '/chat/mobile/friend/' : '/chat/friend/',
      icon: { name: 'users_oline', label: '好友' },
      onClick: () => { isMobile ? navigate('/chat/mobile/friend/') : navigate('/chat/friend/'); setTitle('好友列表'); }
    },
    {
      key: 'news',
      path: isMobile ? '/chat/mobile/dialog/' : '/chat/dialog/',
      icon: { name: 'chat-bubble-bottom-center-text', label: '消息' },
      onClick: () => { isMobile ? navigate('/chat/mobile/dialog/') : navigate('/chat/dialog/'); setTitle('消息列表'); }
    },
  ], [isMobile, navigate, getTimestampMs]);

  const visibleItems = items; // 如果有 display: false 的需求，在此过滤

  // --- PC 端布局 ---
  if (!isMobile) {
    return (
      <DesktopShell>
        <DesktopShell.Left width={80}>
          <Center>
            <SizedBox height={20} />
            <ListView>
              {visibleItems.map((item) => (
                <Padding value={5} key={item.key}>
                  <Icon
                    name={item.icon.name}
                    label={item.icon.label}
                    onClick={() => item.onClick()}
                    active={location.pathname === item.path} // 自动高亮
                  />
                </Padding>
              ))}
            </ListView>
          </Center>
        </DesktopShell.Left>
        <DesktopShell.Content>
          <AppBar title={title} />
          <Outlet />
        </DesktopShell.Content>
      </DesktopShell>
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
        <Row align="center">
          {visibleItems.map((item) => (
            <Row.Col key={item.key}>
              <Padding value={6}>
                <Center>
                  <Icon
                    size={22}
                    name={item.icon.name}
                    label={item.icon.label}
                    onClick={() => item.onClick()}
                    active={location.pathname === item.path} // 自动高亮
                  />
                </Center>
              </Padding>
            </Row.Col>
          ))}
        </Row>
      </AppShell.Footer>
    </AppShell>
  );
}