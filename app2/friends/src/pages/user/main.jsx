import React, { useState,useRef } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { useUser, useWinWidth, useLogin } from 'hooks';
import { MenuMobile } from 'components';
// import { useLocalStorageState } from 'ahooks';


export function User() {
  const navigate = useNavigate();

  const { user } = useUser()
  // const [usrInfo, setUsrInfo] = useLocalStorageState('usrInfo')
  const { isExpired } = useLogin()
  const [title, setTitle] = useState('主页')

  const items = [
    { key: 'home', display: true, icon: { name: 'home', label: '主页' }, onClick: () => navigate('/') },
    { key: 'login', display: true, icon: { name: 'user-circle', label: '登陆' }, onClick: () => { navigate('/user/login/'); setTitle('用户登陆'); } },
    { key: 'register', display: new Set(['admin']).has(user?.role), icon: { name: 'user-plus', label: '账号' }, onClick: () => { navigate('/user/register/'); setTitle('注册账号'); } },
    { key: 'roles', display: new Set(['admin']).has(user?.role), icon: { name: 'shield-check', label: '权限' }, onClick: () => { navigate('/user/roles/'); setTitle('角色权限'); } },
  ]



  const { winSize } = useWinWidth()
  return <React.Fragment>
    <MenuMobile size={46}>
      <MenuMobile.Head
        title={title}
        // leftIcon='left-chevron'
        // onClick={() => { console.log('点击了leftIcon图标') }}
      />
      <MenuMobile.Items position={winSize > 415 ? 'left' : 'bottom'}>
        {items}
      </MenuMobile.Items>

      <MenuMobile.Content>
        <Outlet />
      </MenuMobile.Content>
    </MenuMobile>
  </React.Fragment>
}




