import React, { useState, useRef } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { useUser, useWinWidth, useLogin } from 'hooks';
import { MenuMobile } from 'components';
import { Scaffold, AppBar } from 'components/flutter';



export function User() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('主页')

  const drawerMenu = [
    { key: 'login', display: true, icon: { name: 'user-circle', label: '登陆' }, onTap: () => { navigate('/user/login/'); setTitle('登陆') } },
    { key: 'register', display: true, icon: { name: 'user-plus', label: '注册' }, onTap: () => { navigate('/user/register/'); setTitle('注册') } },
    { key: 'settings', display: true, icon: { name: 'cog-6-tooth', label: '设置' }, onTap: () => { navigate('/user/settings/setlist/'); setTitle('设置') } },
  ];

  return (
    <Scaffold
      appBar={<AppBar iconDrawer="menu" title={title} />}
      drawerTitle="首页"
      drawerMenu={drawerMenu}
      body={<Outlet />}
    />
  );
};





