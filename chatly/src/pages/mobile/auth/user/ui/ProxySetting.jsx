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
  mqttBase,
  onPingApi,
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

  // ===== API =====
  const [apiIp, setApiIp] = useState(apiUrl.hostname);
  const [apiPort, setApiPort] = useState(apiUrl.port || '5015');

  // ===== IMG =====
  const [imgIp, setImgIp] = useState(imgUrl.hostname);
  const [imgPort, setImgPort] = useState(imgUrl.port || '9000');

  // ===== MQTT（纯字符串）=====
  const [mqtt, setMqtt] = useState(mqttBase || '127.0.0.1:1883');

  const [confirmModal, setConfirmModal] = useState(false);

  // ===== sync API =====
  useEffect(() => {
    const url = safeParseUrl(apiBase);
    setApiIp(url.hostname);
    setApiPort(url.port || '5015');
  }, [apiBase]);

  // ===== sync IMG =====
  useEffect(() => {
    const url = safeParseUrl(imgBase);
    setImgIp(url.hostname);
    setImgPort(url.port || '9000');
  }, [imgBase]);

  // ===== sync MQTT =====
  useEffect(() => {
    setMqtt(mqttBase || '127.0.0.1:1883');
  }, [mqttBase]);

  // ===== builders =====
  const getApiFullUrl = () => `http://${apiIp}:${apiPort}`;
  const getImgFullUrl = () => `http://${imgIp}:${imgPort}`;
  const getMqtt = () => mqtt;

  const handleSave = () => {
    setConfirmModal(false);
    onSave?.(
      getApiFullUrl(),
      getImgFullUrl(),
      getMqtt()
    );
  };

  return (
    <Paper withBorder p="xs" m="xs" radius="sm">
      <Stack gap="xs">

        {/* ===== API SERVER（保留 ping）===== */}
        <Box>
          <Text fw={600} size="xs" c="dimmed">API SERVER</Text>

          <Group gap={4} wrap="nowrap">
            <TextInput
              value={apiIp}
              onChange={(e) => setApiIp(e.currentTarget.value)}
              style={{ flex: 1 }}
            />

            <TextInput
              value={apiPort}
              onChange={(e) =>
                setApiPort(e.currentTarget.value.replace(/\D/g, ''))
              }
              style={{ width: 65 }}
            />

            {/* ✅ 保留 ping */}
            <Button
              variant="light"
              size="sm"
              onClick={() => onPingApi?.(getApiFullUrl())}
            >
              测试
            </Button>
          </Group>
        </Box>

        {/* ===== IMAGE SERVER（无 ping）===== */}
        <Box>
          <Text fw={600} size="xs" c="dimmed">IMAGE SERVER</Text>

          <Group gap={4} wrap="nowrap">
            <TextInput
              value={imgIp}
              onChange={(e) => setImgIp(e.currentTarget.value)}
              style={{ flex: 1 }}
            />

            <TextInput
              value={imgPort}
              onChange={(e) =>
                setImgPort(e.currentTarget.value.replace(/\D/g, ''))
              }
              style={{ width: 65 }}
            />
          </Group>
        </Box>

        {/* ===== MQTT（纯配置）===== */}
        <Box>
          <Text fw={600} size="xs" c="dimmed">MQTT SERVER</Text>

          <TextInput
            placeholder="host:port (e.g. 127.0.0.1:1883)"
            value={mqtt}
            onChange={(e) => setMqtt(e.currentTarget.value)}
          />
        </Box>

        {/* ===== SAVE ===== */}
        <Button
          onClick={() => setConfirmModal(true)}
          color="green"
          fullWidth
        >
          保存并应用配置
        </Button>

      </Stack>

      {/* ===== CONFIRM ===== */}
      <Modal
        opened={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="确认修改"
        centered
      >
        <Stack>
          <Paper p="xs" bg="gray.0">
            <div>API: {getApiFullUrl()}</div>
            <div>IMAGE: {getImgFullUrl()}</div>
            <div>MQTT: {getMqtt()}</div>
          </Paper>

          <Group grow>
            <Button variant="default" onClick={() => setConfirmModal(false)}>
              取消
            </Button>
            <Button onClick={handleSave} color="green">
              确认
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}