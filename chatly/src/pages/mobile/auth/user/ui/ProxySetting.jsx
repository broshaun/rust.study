import { useState, useEffect } from 'react';
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Modal,
  Box,
} from '@mantine/core';

export function ProxySetting({
  apiBase,
  imgBase,
  onPingApi,
  onPingImg,
  onSave,
}) {
  const safeParseUrl = (urlStr) => {
    try {
      return new URL(urlStr || 'http://127.0.0.1:8080');
    } catch {
      return new URL('http://127.0.0.1:8080');
    }
  };

  const apiUrl = safeParseUrl(apiBase);
  const imgUrl = safeParseUrl(imgBase);

  // 状态管理
  const [apiIp, setApiIp] = useState(apiUrl.hostname);
  const [apiPort, setApiPort] = useState(apiUrl.port || '5015');
  const [imgIp, setImgIp] = useState(imgUrl.hostname);
  const [imgPort, setImgPort] = useState(imgUrl.port || '9000');
  const [confirmModal, setConfirmModal] = useState(false);

  // 同步外部变化
  useEffect(() => {
    const url = safeParseUrl(apiBase);
    setApiIp(url.hostname);
    setApiPort(url.port || '5015');
  }, [apiBase]);

  useEffect(() => {
    const url = safeParseUrl(imgBase);
    setImgIp(url.hostname);
    setImgPort(url.port || '9000');
  }, [imgBase]);

  const getApiFullUrl = () => `http://${apiIp}:${apiPort}`;
  const getImgFullUrl = () => `http://${imgIp}:${imgPort}`;

  const handleSave = () => {
    setConfirmModal(false);
    if (typeof onSave === 'function') {
      onSave(getApiFullUrl(), getImgFullUrl());
    }
  };

  return (
    <Paper withBorder p="xs" m="xs" radius="sm" shadow="none">
      <Stack gap="xs">
        
        {/* --- API Server 区块 --- */}
        <Box>
          <Text fw={600} size="xs" c="dimmed" mb={2}>API SERVER</Text>
          {/* wrap="nowrap" 强行不换行，gap={4} 缩短组件间距 */}
          <Group gap={4} wrap="nowrap" align="center">
            <TextInput
              placeholder="IP 地址 (如 185.245.41.154)"
              value={apiIp}
              onChange={(e) => setApiIp(e.currentTarget.value)}
              size="sm"
              style={{ flex: 1 }} // 自动撑满剩余空间
            />
            <TextInput
              placeholder="端口"
              value={apiPort}
              onChange={(e) => setApiPort(e.currentTarget.value.replace(/\D/g, ''))} // 纯手动纯数字
              type="tel"
              size="sm"
              style={{ width: '65px' }} // 固定端口宽度，更紧凑
            />
            <Button 
              variant="light" 
              size="sm" 
              onClick={() => onPingApi?.(getApiFullUrl())}
              style={{ padding: '0 10px', minWidth: '50px' }}
            >
              测试
            </Button>
          </Group>
        </Box>

        {/* --- Image Server 区块 --- */}
        <Box>
          <Text fw={600} size="xs" c="dimmed" mb={2}>IMAGE SERVER</Text>
          <Group gap={4} wrap="nowrap" align="center">
            <TextInput
              placeholder="IP 地址"
              value={imgIp}
              onChange={(e) => setImgIp(e.currentTarget.value)}
              size="sm"
              style={{ flex: 1 }}
            />
            <TextInput
              placeholder="端口"
              value={imgPort}
              onChange={(e) => setImgPort(e.currentTarget.value.replace(/\D/g, ''))}
              type="tel"
              size="sm"
              style={{ width: '65px' }}
            />
            <Button 
              variant="light" 
              size="sm" 
              onClick={() => onPingImg?.(getImgFullUrl())}
              style={{ padding: '0 10px', minWidth: '50px' }}
            >
              测试
            </Button>
          </Group>
        </Box>

        {/* --- 保存并应用按钮 --- */}
        <Button 
          onClick={() => setConfirmModal(true)} 
          color="green" 
          size="sm" 
          fullWidth 
          mt={4}
        >
          保存并应用配置
        </Button>
      </Stack>

      {/* --- 手机端确认弹窗 --- */}
      <Modal
        opened={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="确认修改"
        centered
        size="85%"
        radius="sm"
      >
        <Stack gap="xs">
          <Paper withBorder p="xs" bg="gray.0" style={{ fontSize: '13px' }}>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#868e96' }}>API: </span>
              <strong style={{ wordBreak: 'break-all' }}>{getApiFullUrl()}</strong>
            </div>
            <div>
              <span style={{ color: '#868e96' }}>图片: </span>
              <strong style={{ wordBreak: 'break-all' }}>{getImgFullUrl()}</strong>
            </div>
          </Paper>

          <Group grow gap="xs" mt="sm">
            <Button onClick={() => setConfirmModal(false)} variant="default" size="sm">
              取消
            </Button>
            <Button onClick={handleSave} color="green" size="sm">
              确认
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}