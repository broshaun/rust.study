import React, { useState, useRef } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { useUser, useWinWidth, useLogin } from 'hooks';
import { MenuMobile } from 'components';



export function User() {
  const navigate = useNavigate();
  const { user } = useUser()
  const { isExpired } = useLogin()
  const [title, setTitle] = useState('主页')

  const items = [
    // { key: 'home', display: true, icon: { name: 'home', label: '主页' }, onClick: () => navigate('/apps/') },
    { key: 'login', display: true, icon: { name: 'user-circle', label: '登陆' }, onClick: () => { navigate('/user/login/'); setTitle('用户登陆'); } },
    { key: 'register', display: true, icon: { name: 'user-plus', label: '注册' }, onClick: () => { navigate('/user/register/'); setTitle('注册账号'); } },
    // { key: 'settings', display: true, icon: { name: 'cog-6-tooth', label: '设置' }, onClick: () => { navigate('/user/settings/setlist/'); setTitle('设置代理'); } },
  ]

  const { winSize } = useWinWidth()
  return <React.Fragment>
    <MenuMobile size={46}>
      <MenuMobile.Head title={title} />
       <MenuMobile.Items position={winSize > 415 ? 'left' : 'bottom'}>{items}</MenuMobile.Items>
      <MenuMobile.Content>
        <Outlet />
      </MenuMobile.Content>
    </MenuMobile>
  </React.Fragment>
}



