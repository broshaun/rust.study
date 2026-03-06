import React, { useState } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { AppBar, Container, Center, Padding, AppShell, Drawer, ListView, Divider, Icon } from 'components/flutter';



export function User() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('主页')

  const drawerMenu = [
    { key: 'login', display: true, icon: { name: 'user-circle', label: '登陆' }, onTap: () => { navigate('/user/login/'); setTitle('登陆') } },
    { key: 'register', display: true, icon: { name: 'user-plus', label: '注册' }, onTap: () => { navigate('/user/register/'); setTitle('注册') } },
    { key: 'settings', display: true, icon: { name: 'cog-6-tooth', label: '设置' }, onTap: () => { navigate('/user/settings/setlist/'); setTitle('设置') } },
  ];


  const [open, setOpen] = useState(false);
  const handleItemClick = (item) => {
    if (!item) return;
    item.onTap();
    setOpen(false);
  };
  return <React.Fragment>
    <Drawer isOpen={open} onClose={() => setOpen(false)} width={150}>
      <Padding>
        <Center alignment='bottom'>
          <h3>导航</h3>
        </Center>
      </Padding>
      <Divider />
      <Padding>
        <ListView>
          {drawerMenu.filter(i => i.display !== false).map((item) =>
            <Padding value={5}>
              <Icon
                name={item?.icon.name}
                label={item?.icon.label}
                onClick={() => handleItemClick(item)}
                labelPos='right'
              />
            </Padding>
          )}
        </ListView>
      </Padding>
    </Drawer>

    <AppShell>

      <AppShell.Header>
        <AppBar title={title} leading="menu" onLeadingClick={() => setOpen(true)} />

      </AppShell.Header>
      <AppShell.Content>
        <Center>
          <Container width={380} >
            <Padding>
              <Outlet />
            </Padding>
          </Container>
        </Center>
      </AppShell.Content>
      {/* <AppShell.Footer>
      </AppShell.Footer> */}
    </AppShell>


  </React.Fragment>
};
