import React, { useMemo, useState } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { useUser, useWinWidth, useLogin } from 'hooks';
import { MenuMobile } from 'components';


export function Chat() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('主页')
  const items2 = [
    { key: 'friend', display: true, icon: { name: 'users_oline', label: '好友' }, onClick: () => { navigate('/chat/friend/') } },
    {
      key: 'msg', display: true,
      icon: { name: 'chat-bubble-bottom-center-text', label: '聊天' },
      onClick: () => { window.open("/#/msg/", "_blank"); setTitle('展示栏') }
    },
    {
      key: 'image', display: true,
      icon: { name: 'user-group-oline', label: '群聊' },
      onClick: () => { navigate('/chat/group/'); setTitle('群聊') }
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




