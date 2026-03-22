import React, { useState } from "react"
import { Outlet, useNavigate } from "react-router";
import { AppBar, AppShell, Drawer, Divider, Icon, XBox, YBox } from 'components/flutter';
import { Stack } from "@mantine/core";



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
    <Drawer isOpen={open} onClose={() => setOpen(false)} width={120}>
      <XBox padding={20}>
        <h3>导航</h3>
      </XBox>
      <Divider fade={true} />

      <Stack padding={10} gap={20}>
        {drawerMenu.filter(i => i.display !== false).map((item) =>
          <Icon
            key={item.key}
            name={item?.icon.name}
            label={item?.icon.label}
            onClick={() => handleItemClick(item)}
            labelPos='right'
          />
        )}
      </Stack>
    </Drawer>

    <AppShell>
      <AppShell.Header>
        <AppBar leading={<Icon name="menu" onClick={() => setOpen(true)} />} />
      </AppShell.Header>
      <AppShell.Content>
        <Outlet />
      </AppShell.Content>
    </AppShell>
  </React.Fragment>
};
