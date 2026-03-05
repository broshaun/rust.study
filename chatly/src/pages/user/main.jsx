import React, { useState } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { Scaffold, AppBar, Container, Center, Padding } from 'components/flutter';



export function User() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('主页')

  const drawerMenu = [
    { key: 'login', display: true, icon: { name: 'user-circle', label: '登陆' }, onTap: () => { navigate('/user/login/'); setTitle('登陆') } },
    { key: 'register', display: true, icon: { name: 'user-plus', label: '注册' }, onTap: () => { navigate('/user/register/'); setTitle('注册') } },
    { key: 'settings', display: true, icon: { name: 'cog-6-tooth', label: '设置' }, onTap: () => { navigate('/user/settings/setlist/'); setTitle('设置') } },
  ];


  // 2. 定义底部导航（BottomNavigationBar）
  const renderBottomNav = (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
      <button >
        首页
      </button>
      <button >
        订单
      </button>
      <button >
        我的
      </button>
    </div>
  );

  return (
    <Scaffold
      appBar={
        <AppBar title={title} iconDrawer="menu" />
      }
      drawerTitle="首页"
      drawerMenu={drawerMenu}

      body={
        <Padding value={32}>
          <Center mode='vertical'>
            <Container width={380} >
              <Outlet />
            </Container>
          </Center>
        </Padding>
      }

      bottomNavigationBar={renderBottomNav}

    />
  );
};





