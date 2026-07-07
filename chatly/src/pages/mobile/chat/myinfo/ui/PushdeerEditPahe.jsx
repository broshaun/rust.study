import React, { useState } from 'react';
import { Box, Button, Paper, Stack, Text, Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconClipboard, IconDeviceFloppy } from '@tabler/icons-react';

export function PushdeerEditPage({ value = '', onClick }) {
  // 暂存从剪贴板粘贴出来的待保存 Key
  const [pastedValue, setPastedValue] = useState('');

  // 1. 处理粘贴读取
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const trimmed = clipboardText?.trim();

      if (!trimmed) {
        alert('剪贴板中没有可用的文本内容！');
        return;
      }
      setPastedValue(trimmed);
    } catch (err) {
      alert('无法读取剪贴板，请允许浏览器访问剪贴板权限。');
      console.error(err);
    }
  };

  // 2. 处理保存提交
  const handleSave = () => {
    if (canSave) {
      onClick?.(pastedValue);
      setPastedValue(''); // 保存成功后清空待保存暂存区
    }
  };

  // 状态判定：粘贴了有效的新 Key，且与当前存的旧 Key 不一致
  const hasNewPasted = Boolean(pastedValue);
  const canSave = pastedValue && pastedValue !== value;

  // 脱敏显示预览框的内容：如果已经粘贴了新值，显示新值；否则显示当前在用的值
  const displayValue = pastedValue || value;
  const maskedValue = displayValue
    ? `${displayValue.slice(0, 8)}****${displayValue.slice(-6)}`
    : '未设置';

  return (
    // bg="white" 并调小上下 py 间距，更符合手机端沉浸式体验
    <Box mih="100vh" px="md" py={40} bg="white">
      {/* 去掉了 maw{440} 限制、边框、阴影和背景色，全靠灵动布局自适应手机屏幕 */}
      <Box style={{ maxWidth: '100%' }}>
        <Stack gap="xl">
          
          {/* 头部标题与说明 */}
          <Box>
            <Text size="xl" fw={700} ta="center">
              配置 Pushdeer Key
            </Text>
            <Text size="sm" c="dimmed" mt={6} ta="center" px="xs">
              点击右侧按钮一键读取剪贴板，确认无误后保存。
            </Text>
          </Box>

          {/* 核心交互区：彻底去掉所有的 Border 线条 */}
          <Group wrap="nowrap" gap="xs" align="stretch">
            {/* 预览无框色块 */}
            <Paper p="xs" radius="md" bg="gray.1" ta="center" flex={1}>
              <Text size="10px" c="dimmed" lts={0.5} style={{ textTransform: 'uppercase' }}>
                {pastedValue ? '已读取待保存的 KEY' : '当前正在使用的 KEY'}
              </Text>
              <Tooltip label={displayValue || '未设置'} position="top" withArrow disabled={!displayValue}>
                <Text fw={600} size="sm" c={displayValue ? 'dark.4' : 'gray.5'} mt={2} style={{ fontFamily: 'monospace' }}>
                  {maskedValue}
                </Text>
              </Tooltip>
            </Paper>

            {/* 粘贴按钮：初始灰色无边框，粘贴后变绿 */}
            <ActionIcon 
              variant={hasNewPasted ? "filled" : "light"}
              color={hasNewPasted ? "green" : "gray"}
              size={48} 
              radius="md"
              onClick={handlePaste}
            >
              <IconClipboard size={22} />
            </ActionIcon>
          </Group>

          {/* 底部保存按钮：在手机端将 size 升级为 lg 提升触控面积 */}
          <Button 
            size="lg"
            radius="md" 
            color="blue"
            disabled={!canSave}
            leftSection={<IconDeviceFloppy size={20} />}
            onClick={handleSave}
            fullWidth
          >
            保存修改
          </Button>
          
        </Stack>
      </Box>
    </Box>
  );
}