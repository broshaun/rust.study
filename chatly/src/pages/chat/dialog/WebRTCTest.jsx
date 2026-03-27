import React, { useEffect, useState } from 'react';
import { Alert, Badge, Box, Button, Group, Paper, Stack, Text } from '@mantine/core';

export function WebRTCTest() {
  const [status, setStatus] = useState('检测中');
  const [detail, setDetail] = useState('');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const hasMediaDevices =
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function';

    if (hasMediaDevices) {
      setSupported(true);
      setStatus('可请求麦克风');
      setDetail('');
    } else {
      setSupported(false);
      setStatus('当前环境没有 mediaDevices');
      setDetail('当前运行环境没有提供 navigator.mediaDevices。先检查 macOS 权限声明和 Tauri 运行环境。');
    }
  }, []);

  const testMic = async () => {
    try {
      setDetail('');
      setStatus('正在请求麦克风权限');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      setStatus('麦克风权限获取成功');
      setDetail(`成功获取到 ${stream.getAudioTracks().length} 条音频轨道`);

      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      setStatus('请求失败');
      setDetail(message);
    }
  };

  const isError =
    status.includes('失败') ||
    status.includes('没有') ||
    status.includes('错误');

  return (
    <Paper p="xl" withBorder radius="md" shadow="sm" style={{ maxWidth: 520, margin: '40px auto' }}>
      <Stack gap="md">
        <Text fw={700} size="xl">
          麦克风最简测试
        </Text>

        <Box p="md" bg="gray.0" style={{ borderRadius: 8 }}>
          <Group justify="space-between">
            <Text size="sm" fw={600}>状态</Text>
            <Badge color={isError ? 'red' : 'green'}>
              {status}
            </Badge>
          </Group>
        </Box>

        {detail && (
          <Alert color={isError ? 'red' : 'blue'} title="详情" variant="light">
            <Text size="sm">{detail}</Text>
          </Alert>
        )}

        <Button onClick={testMic} disabled={!supported}>
          请求麦克风权限
        </Button>
      </Stack>
    </Paper>
  );
}