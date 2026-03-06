import React, { useState } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { useWinWidth, useHttpClient, useDateTime } from 'hooks';
import { MenuMobile } from 'components';
import { useRequest } from 'ahooks';
import { db } from 'hooks/db';

import { AppShell, AppBar, DesktopShell, Row, Padding, Icon, Center, ListView, SizedBox } from 'components/flutter';


export function Chat() {
  const navigate = useNavigate();
  const { getTimestampMs } = useDateTime()
  const { http: httpMsg } = useHttpClient('/api/chat/msg/single/')

  useRequest(() => {
    httpMsg.requestParams('POST').then((results) => {
      if (!results) return;
      const { code, data } = results
      if (data && code === 200) {
        db.table('message').put({ 'uid': data?.uid, 'msg': data?.msg, 'timestamp': data?.timestamp, 'signal': 'receive' })
        db.table('friends').where('uid').equals(data?.uid).modify((user) => {
          user.signal = 'news'
          user.dialog = 1
        })
      }
    })
    return 'ok'
  }, { pollingInterval: 1000, pollingWhenHidden: false })

  const { isMobile } = useWinWidth()
  const [title, setTitle] = useState('Chatly')
  const items2 = [
    // { key: 'home', display: true, icon: { name: 'home', label: '主页' }, onClick: () => navigate('/apps/') },
    { key: 'self', display: true, icon: { name: 'user-oouline', label: '我的' }, onClick: () => { navigate('/chat/self/mylist/', { state: getTimestampMs() }); setTitle('我的信息') } },

    { key: 'friend', display: true, icon: { name: 'users_oline', label: '好友' }, onClick: () => { isMobile ? navigate('/chat/mobile/friend/') : navigate('/chat/friend/'); setTitle('好友列表') } },
    // { key: 'users', display: true, icon: { name: 'user-group-oline', label: '群聊' }, },
    { key: 'news', display: true, icon: { name: 'chat-bubble-bottom-center-text', label: '消息' }, onClick: () => { isMobile ? navigate('/chat/mobile/dialog/') : navigate('/chat/dialog/'); setTitle('消息列表') } },
  ];
  const handleItemClick = (item) => {
    if (!item) return;
    item.onClick();
  };

  return <React.Fragment>
    {!isMobile ?
      <DesktopShell>
        <DesktopShell.Left>
          <Center>
            <SizedBox height={20} />
            <ListView>
              {items2.filter(i => i.display !== false).map((item) =>
                <Padding value={5}>
                  <Icon
                    name={item?.icon.name}
                    label={item?.icon.label}
                    onClick={() => handleItemClick(item)}

                  />
                </Padding>
              )}
            </ListView>
          </Center>
        </DesktopShell.Left>
        <DesktopShell.Content>
          <Outlet />
        </DesktopShell.Content>

      </DesktopShell>
      :
      <AppShell>
        <AppShell.Header>
          <AppBar />
        </AppShell.Header>
        <AppShell.Content>
          <Outlet />
        </AppShell.Content>
        <AppShell.Footer>
          <Row>
            {
              items2.filter(i => i.display !== false).map((item) =>
                <Row.Col>
                  <Padding value={6}>
                    <Center>
                      <Icon
                        size={20}
                        name={item?.icon.name}
                        label={item?.icon.label}
                        onClick={() => handleItemClick(item)}
                      />
                    </Center>
                  </Padding>
                </Row.Col>
              )
            }
          </Row>
        </AppShell.Footer>
      </AppShell>
    }

  </React.Fragment>









}






