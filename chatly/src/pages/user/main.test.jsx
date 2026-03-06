import React, { useState } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { AppBar, Container, Center, Padding, AppShell, Drawer, ListView, Divider, Icon, DesktopShell,SizedBox } from 'components/flutter';



export function User2() {
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

  const [open, setOpen] = useState(false);
  const handleItemClick = (item) => {
    if (!item) return;
    item.onTap();
    setOpen(false);
  };
  return (

    <DesktopShell>
      <DesktopShell.Header>
      </DesktopShell.Header>
      <DesktopShell.Content>
        <Center>
          <Container width={380} >
            <Padding>
              <Outlet />
            </Padding>
          </Container>
        </Center>
      </DesktopShell.Content>
      <DesktopShell.Left>
        <Center>
          <SizedBox height={20}/>
          <Divider/>
          <ListView>
            
            {drawerMenu.filter(i => i.display !== false).map((item) =>
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
    </DesktopShell>


  );
};
