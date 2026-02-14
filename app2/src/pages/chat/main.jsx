import React, { useMemo, useState } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { useUser, useWinWidth, useLogin } from 'hooks';
import { MenuMobile } from 'components';


export function Chat() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('主页')
  const items2 = [
    { key: 'friend', display: true, icon: { name: 'users_oline', label: '好友' }, onClick: () => { navigate('/chat/friend/'); setTitle('好友') } },
    { key: 'news', display: true, icon: { name: 'chat-bubble-bottom-center-text', label: '消息' }, onClick: () => { navigate('/chat/dialog/'); setTitle('消息') } },
    {
      key: 'users', display: true,
      icon: { name: 'user-group-oline', label: '群聊' },
      // onClick: () => { navigate('/chat/group/'); setTitle('群聊') }
    },
    {
      key: 'find', display: true,
      icon: { name: 'magnifying-glass-circle', label: '查找' },
      onClick: () => { navigate('/chat/friend/find/'); setTitle('查找') }
    },
  ];
  const { winSize } = useWinWidth()


  return <React.Fragment>

    <MenuMobile size={46}>
      <MenuMobile.Head title={title} leftIcon='left-chevron' onClick={() => { navigate('/') }} />
      <MenuMobile.Items position={winSize > 415 ? 'left' : 'bottom'}>{items2}</MenuMobile.Items>
      <MenuMobile.Content>
        <Outlet />
      </MenuMobile.Content>
    </MenuMobile>

  </React.Fragment>
}




