import React from "react"
import { Outlet, useNavigate } from "react-router";
import { IconLabel } from 'components';
import { Stack, Drawer, Title, AppShell, Burger, Divider } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { getSafeArea } from "utils";
import { getDeviceInfo } from "tauri-plugin-device-info-api";

const device = await getDeviceInfo();

export function AuthShell() {
  
  const { top, bottom } = getSafeArea(device)
  const navigate = useNavigate();

  const drawerMenu = [
    { key: 'login', display: true, icon: { name: 'IconUserCircle', label: '登陆' }, onTap: () => { navigate('/mobile/auth/user/') } },
    { key: 'register', display: true, icon: { name: 'IconUserPlus', label: '注册' }, onTap: () => { navigate('/mobile/auth/user/register/') } },
    { key: 'settings', display: true, icon: { name: 'IconSettings', label: '设置' }, onTap: () => { navigate('/mobile/auth/user/proxy/') } },
  ];

  const [opened, { open, close }] = useDisclosure(false);

  const handleItemClick = (item) => {
    if (!item) return;
    item.onTap();
    close();
  };

  return (
    <React.Fragment>
      <Drawer opened={opened} onClose={close} size={120} withCloseButton={false}>
        <Title order={4} mb="md">导航</Title>

        <Divider
          mb="md"
          styles={{
            root: {
              border: 'none',
              height: '1px',
              backgroundImage: 'linear-gradient(to right, transparent, light-dark(rgba(0,0,0,0.15), rgba(255,255,255,0.15)) 50%, transparent)'
            }
          }}
        />

        <Stack padding={10} gap={10}>
          {drawerMenu.filter(i => i.display !== false).map((item) =>
            <IconLabel
              key={item.key}
              name={item.icon.name}
              label={item.icon.label}
              onClick={() => handleItemClick(item)}
              labelPos='right'
              size={20}
            />
          )}
        </Stack>
      </Drawer>

      <AppShell padding={10} header={{ height: 45 + top }} >
        <AppShell.Header pt={top}>
          <Burger onClick={open} color="gray" m="sm" size="sm" />
        </AppShell.Header >
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </React.Fragment>
  );
}