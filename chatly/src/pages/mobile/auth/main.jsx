import React from "react"
import { Outlet, useNavigate } from "react-router";
import { IconLable } from 'components'; // 🔥 切换为刚优化好的 IconLable
import { Stack, Drawer, Title, AppShell, Burger, Divider } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

export function AuthShell() {
  const navigate = useNavigate();
  
  const drawerMenu = [
    { key: 'login', display: true, icon: { name: 'IconUserCircle', label: '登陆' }, onTap: () => { navigate('/mobile/auth/user/') } },
    { key: 'register', display: true, icon: { name: 'IconUserPlus', label: '注册' }, onTap: () => { navigate('/mobile/auth/user/register/') } },
    { key: 'settings', display: true, icon: { name: 'IconSettings', label: '设置' }, onTap: () => { navigate('/mobile/auth/user/items/') } },
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
        
        {/* 两边淡化渐变分割线 */}
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
        
        {/* Drawer 内部菜单列表 */}
        <Stack padding={10} gap={10}>
          {drawerMenu.filter(i => i.display !== false).map((item) =>
            <IconLable
              key={item.key}
              name={item.icon.name}
              label={item.icon.label}
              onClick={() => handleItemClick(item)}
              labelPos='right' // 横向排列标签
              size={20}        // 侧边栏菜单图标建议 20-22px，看起来更精致
            />
          )}
        </Stack>
      </Drawer>

      <AppShell padding={10} header={{ height: 45 }} >
        <AppShell.Header >
          <Burger onClick={open} color="gray" m="sm" size="sm" />
        </AppShell.Header>
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </React.Fragment>
  );
}