import React, { useState } from "react"
import { Outlet, useNavigate } from "react-router";
import { Divider, Icon } from 'components/flutter';
import { Stack, Drawer, Title, AppShell, Burger } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';


export function AuthShell() {
  const navigate = useNavigate();
  const drawerMenu = [
    { key: 'login', display: true, icon: { name: 'user-circle', label: '登陆' }, onTap: () => { navigate('/mobile/auth/user/') } },
    { key: 'register', display: true, icon: { name: 'user-plus', label: '注册' }, onTap: () => { navigate('/mobile/auth/user/register/') } },
    { key: 'settings', display: true, icon: { name: 'cog-6-tooth', label: '设置' }, onTap: () => { navigate('/mobile/auth/user/items/') } },
  ];

  const [opened, { open, close }] = useDisclosure(false);
  const handleItemClick = (item) => {
    if (!item) return;
    item.onTap();
    close()
  };
  return <React.Fragment>
    <Drawer opened={opened} onClose={close} size={120} withCloseButton={false}>
      <Title order={4} mb="md">导航</Title>
      <Divider fade={true} />
      <Stack padding={10} gap={10}>
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

    <AppShell padding={10} header={{ height: 45 }} >
      <AppShell.Header >
        <Burger onClick={open} color="gray" m="sm" />
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  </React.Fragment>
};
