import React, { useState } from '.store/react@18.3.1/node_modules/react'
import { Outlet, useNavigate } from "react-router-dom";
import { useWinWidth, useHttpClient, useDateTime } from 'hooks';
import { MenuMobile } from 'components';
import { useRequest } from 'ahooks';
import { db } from 'hooks/db';


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
  const [title, setTitle] = useState('主页')
  const items2 = [
    // { key: 'home', display: true, icon: { name: 'home', label: '主页' }, onClick: () => navigate('/apps/') },
    { key: 'news', display: true, icon: { name: 'chat-bubble-bottom-center-text', label: '消息' }, onClick: () => { isMobile ? navigate('/chat/mobile/dialog/') : navigate('/chat/dialog/'); setTitle('消息列表') } },
    { key: 'friend', display: true, icon: { name: 'users_oline', label: '好友' }, onClick: () => { isMobile ? navigate('/chat/mobile/friend/') : navigate('/chat/friend/'); setTitle('好友列表') } },
    // { key: 'users', display: true, icon: { name: 'user-group-oline', label: '群聊' }, },
    { key: 'self', display: true, icon: { name: 'user-oouline', label: '我的' }, onClick: () => { navigate('/chat/self/mylist/', { state: getTimestampMs() }); setTitle('我的信息') } },
  ];

  return <React.Fragment>
    <MenuMobile size={46}>
      {/* <MenuMobile.Head title={title} /> */}
      <MenuMobile.Items position={isMobile ? 'bottom' : 'left'}>{items2}</MenuMobile.Items>
      <MenuMobile.Content>
        <Outlet />
      </MenuMobile.Content>
    </MenuMobile>
  </React.Fragment>
}






