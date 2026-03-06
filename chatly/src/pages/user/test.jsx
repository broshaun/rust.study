import React, { useState } from 'react';
// 假设你已经通过 index.jsx 统一导出了这些组件
import {
  AppShell,
  AppBar,
  Drawer,
  Row,
  Col,
  Center,
  Left,
  SizedBox,
  Button,
  Divider
} from 'components/flutter';




const ExportDashboard = () => {
  

  return (
    <AppShell>
      {/* 1. 顶栏：只占位，不耦合 */}
      <AppShell.Header>
        <AppBar title="出口管理" leading="menu" onLeadingClick={() => setOpen(true)} />
      </AppShell.Header>

      {/* 2. 抽屉：完全独立，只需在页面任何地方放置即可 */}
      <Drawer isOpen={open} onClose={() => setOpen(false)}>
        <div style={{ padding: 20 }}>菜单内容</div>
      </Drawer>

      {/* 3. 主体：负责业务 */}
      <AppShell.Content padding={16}>
        <Center>
          <p>这里是透析器数据列表...</p>
        </Center>
      </AppShell.Content>

      {/* 4. 底栏：可选 */}
      <AppShell.Footer>
        <div style={{ height: 50, background: '#fff', textAlign: 'center' }}>底部操作栏</div>
      </AppShell.Footer>
    </AppShell>
  )
}

export default ExportDashboard;