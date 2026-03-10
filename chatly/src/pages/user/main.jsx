import React, { useState } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { AppBar, Container, Center, Padding, AppShell, Column, Drawer, Divider, Icon } from 'components/flutter';



export function User() {
  const navigate = useNavigate();
  const drawerMenu = [
    { key: 'login', display: true, icon: { name: 'user-circle', label: '登陆' }, onTap: () => { navigate('/user/login/') } },
    { key: 'register', display: true, icon: { name: 'user-plus', label: '注册' }, onTap: () => { navigate('/user/register/') } },
    { key: 'settings', display: true, icon: { name: 'cog-6-tooth', label: '设置' }, onTap: () => { navigate('/user/settings/setlist/') } },
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
      <Divider fade={true} />
      <Padding>
        <Column>
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
        </Column>
      </Padding>
    </Drawer>

    <AppShell>
      <AppShell.Header>
        <AppBar leading={<Icon name="menu" onClick={() => setOpen(true)} />} />
      </AppShell.Header>
      <AppShell.Content>
        <Center alignment='top'>
          <Container width={380}>
            <Outlet />
          </Container>
        </Center>
      </AppShell.Content>
    </AppShell>
  </React.Fragment>
};
