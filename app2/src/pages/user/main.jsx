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
    { key: 'home', display: true, icon: { name: 'home', label: '主页' }, onClick: () => navigate('/apps/') },
    { key: 'login', display: true, icon: { name: 'user-circle', label: '登陆' }, onClick: () => { navigate('/user/login/'); setTitle('用户登陆'); } },
    { key: 'register', display: true, icon: { name: 'user-plus', label: '注册' }, onClick: () => { navigate('/user/register/'); setTitle('注册账号'); } },
  ]

  const { winSize } = useWinWidth()
  return <React.Fragment>
    <MenuMobile size={46}>
      <MenuMobile.Head title={title} />
      <MenuMobile.Items position={'left'}>{items}</MenuMobile.Items>
      <MenuMobile.Content>
        <Outlet />
      </MenuMobile.Content>
    </MenuMobile>
  </React.Fragment>
}

<Login>
  <Login.Head title='登记界面' avatar='./favicon.png' />
  <Login.Input>
    <input/>
  </Login.Input>
  <Login.Submit>
    <button>登录</button>
  </Login.Submit>
</Login>


