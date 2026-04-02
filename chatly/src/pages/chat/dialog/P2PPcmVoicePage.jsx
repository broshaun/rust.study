import React, { useMemo, useState } from "react";
import {
  Container,
  Paper,
  Title,
  SimpleGrid,
  Text,
  Button,
  Group,
  Box,
  ScrollArea,
  Divider,
  Alert,
  Badge,
  Modal,
  ActionIcon,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router";

import { useP2PTransport } from "hooks/voice/useP2PTransport";
import { usePcmVoice } from "hooks/voice/usePcmVoice";

export function P2PPcmVoicePage() {
  const transport = useP2PTransport({
    pacingIntervalMs: 10,
    maxSendQueuePackets: 24,
  });

  const voice = usePcmVoice({
    sampleRate: 48000,
    frameSamples: 480,
    minBufferFrames: 3,
    maxBufferFrames: 12,
    enableVad: false,
    sendPacket: transport.send,
    subscribePacket: transport.onMessage,
  });

  const [parsedRemoteAddr, setParsedRemoteAddr] = useState(null);
  const [pasteError, setPasteError] = useState("");
  const [openedModal, setOpenedModal] = useState(null);
  const navigate = useNavigate();

  const localReady = useMemo(() => !!transport.localAddrJson, [transport.localAddrJson]);
  const remoteReady = useMemo(() => !!parsedRemoteAddr, [parsedRemoteAddr]);

  const handlePasteFromClipboard = async () => {
    try {
      setPasteError("");
      setParsedRemoteAddr(null);

      const text = await navigator.clipboard.readText();

      if (!text || !text.trim()) {
        setPasteError("剪贴板为空");
        return;
      }

      transport.setRemoteAddrJson(text);

      try {
        setParsedRemoteAddr(JSON.parse(text));
      } catch {
        setPasteError("不是有效 JSON");
      }
    } catch {
      setPasteError("无法读取剪贴板");
    }
  };

  const handleBack = () => {
    navigate("/chat/dialog");
  };

  const handleReset = async () => {
    try {
      await voice.stopCapture();
    } catch (_) {}

    try {
      voice.resetPlayback?.();
    } catch (_) {}

    try {
      await transport.close();
    } catch (_) {}
  };

  const mergedLogs = useMemo(() => {
    const tLogs = transport.logs || [];
    const vLogs = voice.logs || [];
    return [...tLogs, ...vLogs].slice(-300);
  }, [transport.logs, voice.logs]);

  const mergedError = transport.lastError || voice.lastError;

  return (
    <Container size="lg" py={{ base: 8, sm: 12 }}>
      <Paper shadow="xs" radius="lg" p={{ base: "sm", sm: "md" }} withBorder>
        <Group justify="space-between" align="center" mb="sm" wrap="nowrap">
          <ActionIcon variant="light" size="md" radius="xl" onClick={handleBack}>
            <IconArrowLeft size={18} />
          </ActionIcon>

          <Title order={4} ta="center" style={{ flex: 1 }}>
            P2P 控制台
          </Title>

          <Box w={36} />
        </Group>

        <SimpleGrid
          cols={{ base: 1, xs: 3 }}
          spacing="xs"
          verticalSpacing="xs"
          mb="sm"
        >
          <StatusBox label="网络" value={transport.status} active={transport.connected} />
          <StatusBox label="麦克风" value={voice.captureStatus} active={voice.isCapturing} />
          <StatusBox
            label="播放"
            value={voice.playbackStatus}
            active={voice.playbackStatus === "播放中"}
          />
        </SimpleGrid>

        <Paper withBorder p="xs" radius="md" mb="sm" bg="gray.0">
          <Group gap="xs" wrap="wrap">
            <Button
              size="xs"
              radius="md"
              onClick={transport.init}
              disabled={!transport.canInit}
            >
              启动
            </Button>

            <Button
              size="xs"
              radius="md"
              onClick={transport.connect}
              disabled={!transport.canConnect}
              color="green"
            >
              连接
            </Button>

            <Button
              size="xs"
              radius="md"
              onClick={handleReset}
              color="red"
              variant="light"
            >
              重置
            </Button>

            <Button
              size="xs"
              radius="md"
              onClick={voice.startCapture}
              disabled={!transport.connected || !voice.canStartTalk}
            >
              讲话
            </Button>

            <Button
              size="xs"
              radius="md"
              onClick={voice.stopCapture}
              disabled={!voice.canStopTalk}
              color="red"
            >
              停止
            </Button>
          </Group>
        </Paper>

        {pasteError && (
          <Alert color="red" mb="sm" p="xs" radius="md">
            {pasteError}
          </Alert>
        )}

        <SimpleGrid
          cols={{ base: 1, sm: 2 }}
          spacing="sm"
          verticalSpacing="sm"
          mb="sm"
        >
          <AddressCard
            title="本地地址"
            active={localReady}
            onCopy={transport.copyLocalAddr}
            onView={() => setOpenedModal("local")}
          />

          <AddressCard
            title="远端地址"
            active={remoteReady}
            onPaste={handlePasteFromClipboard}
            onView={() => setOpenedModal("remote")}
          />
        </SimpleGrid>

        <Divider mb="xs" />

        <SimpleGrid
          cols={{ base: 2, xs: 3, sm: 6 }}
          spacing="xs"
          verticalSpacing="xs"
          mb="sm"
        >
          <Metric label="发送" value={transport.metrics.sent} />
          <Metric label="接收" value={transport.metrics.recv} />
          <Metric label="播放" value={voice.metrics.played} />
          <Metric label="缓冲" value={voice.metrics.buffered} />
          <Metric label="发送帧" value={voice.metrics.sentFrames} />
          <Metric label="接收帧" value={voice.metrics.recvFrames} />
        </SimpleGrid>

        <SimpleGrid
          cols={{ base: 2, xs: 2, sm: 4 }}
          spacing="xs"
          verticalSpacing="xs"
          mb="sm"
        >
          <Metric label="当前包字节" value={transport.metrics.lastPayloadBytes} suffix="B" />
          <Metric label="平均包字节" value={transport.metrics.avgPayloadBytes} suffix="B" />
          <Metric label="VAD丢弃" value={voice.metrics.vadDropped} />
          <Metric label="发送丢弃" value={transport.metrics.paceDropped} />
        </SimpleGrid>

        <Divider mb="xs" />
        <Text fw={600} size="sm" mb={6}>
          运行日志
        </Text>

        <ScrollArea h={180}>
          <Box
            p="xs"
            style={{
              background: "#0f172a",
              color: "#e2e8f0",
              fontSize: 11,
              fontFamily: "monospace",
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              lineHeight: 1.45,
            }}
          >
            {mergedLogs.length ? mergedLogs.join("\n") : "暂无日志"}
          </Box>
        </ScrollArea>

        {mergedError && (
          <Alert color="red" mt="sm" p="xs" radius="md">
            错误提示: {mergedError.message || String(mergedError)}
          </Alert>
        )}
      </Paper>

      <Modal
        opened={openedModal === "local"}
        onClose={() => setOpenedModal(null)}
        title={
          <Text fw={700} ta="center" w="100%">
            本地地址
          </Text>
        }
        size="xl"
        radius="lg"
        centered
      >
        <JsonViewer json={transport.localAddrJson} />
      </Modal>

      <Modal
        opened={openedModal === "remote"}
        onClose={() => setOpenedModal(null)}
        title={
          <Text fw={700} ta="center" w="100%">
            远端地址
          </Text>
        }
        size="xl"
        radius="lg"
        centered
      >
        <JsonViewer json={transport.remoteAddrJson} />
      </Modal>
    </Container>
  );
}

function AddressCard({ title, active, onCopy, onPaste, onView }) {
  return (
    <Paper withBorder radius="md" p="sm" bg="white">
      <Group justify="space-between" align="center" wrap="wrap" gap="xs">
        <Group gap={8} wrap="nowrap">
          <Text size="sm" fw={600}>
            {title}
          </Text>

          <Badge size="sm" variant="light" color={active ? "green" : "gray"}>
            {active ? "就绪" : "未就绪"}
          </Badge>
        </Group>

        <Group gap={6} wrap="wrap" justify="flex-end">
          {onCopy && (
            <Button size="xs" radius="md" variant="light" onClick={onCopy}>
              复制
            </Button>
          )}

          {onPaste && (
            <Button size="xs" radius="md" variant="light" onClick={onPaste}>
              粘贴
            </Button>
          )}

          <Button
            size="xs"
            radius="md"
            variant="light"
            onClick={onView}
            disabled={!active}
          >
            查看
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}

function JsonViewer({ json }) {
  let displayText = "暂无数据";

  if (json && json.trim()) {
    try {
      displayText = JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      displayText = json;
    }
  }

  return (
    <ScrollArea h={420} type="always" offsetScrollbars>
      <Box
        p="md"
        style={{
          background: "#0f172a",
          color: "#e2e8f0",
          fontSize: 12,
          fontFamily: "monospace",
          borderRadius: 8,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          lineHeight: 1.5,
        }}
      >
        {displayText}
      </Box>
    </ScrollArea>
  );
}

function StatusBox({ label, value, active }) {
  return (
    <Paper withBorder radius="md" p="xs">
      <Text size="10px" c="dimmed" mb={2}>
        {label}
      </Text>
      <Badge size="sm" variant="light" color={active ? "green" : "gray"}>
        {value || "-"}
      </Badge>
    </Paper>
  );
}

function Metric({ label, value, suffix = "" }) {
  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <Paper withBorder radius="md" p="xs">
      <Text size="10px" c="dimmed" mb={2}>
        {label}
      </Text>
      <Text size="sm" fw={600}>
        {hasValue ? `${value}${suffix}` : "-"}
      </Text>
    </Paper>
  );
}