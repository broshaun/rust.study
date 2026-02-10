import React, { useMemo, useState } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { useUser, useWinWidth, useLogin } from 'hooks';
import { MenuMobile } from 'components';
// import { useLocalStorageState } from 'ahooks';

export function Display() {
  const navigate = useNavigate();

  const { user } = useUser()
  // const [usrInfo, setUsrInfo] = useLocalStorageState('usrInfo')
  const { isExpired, isLogged } = useLogin()

  // console.log('isExpired', isExpired)
  // console.log('isLogged', isLogged)

  const [title, setTitle] = useState('主页')
  const items2 = [
    {
      key: 'home',
      display: true,
      icon: { name: 'home', label: '主页' },
      onClick: () => { navigate('/') }
    },
    { key: 'logon', display: isExpired, icon: { name: 'user-circle', label: '登陆' }, onClick: () => { navigate('/user/login/') } },
    {
      key: 'show',
      display: new Set(['admin', 'views', 'shows']).has(user?.role),
      icon: { name: 'clipboard-document-list', label: '展示' },
      onClick: () => { navigate('/display/show/'); setTitle('展示栏') }
    },
    {
      key: 'image',
      display: new Set(['admin', 'views', 'shows']).has(user?.role),
      icon: { name: 'photo', label: '相册' },
      onClick: () => { navigate('/display/image/');; setTitle('个人相册') }
    },
  ];

  const { winSize } = useWinWidth()
  return <React.Fragment>

    <MenuMobile size={46}>
      <MenuMobile.Head
        title={title}
        // leftIcon='left-chevron'
        // onClick={() => { console.log('点击了leftIcon图标') }}
      />
      <MenuMobile.Items position={winSize > 415 ? 'left' : 'bottom'}>
        {items2}
      </MenuMobile.Items>

      <MenuMobile.Content>
        <Outlet />
      </MenuMobile.Content>
    </MenuMobile>

  </React.Fragment>
}





