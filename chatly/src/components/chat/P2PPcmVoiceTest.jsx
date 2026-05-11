import React, { useEffect } from "react";
import {
  Container,
  Paper,
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
} from "@mantine/core";

export function P2PPcmVoiceTest({
  networkStatus = "-",
  networkColor = "gray",

  micStatus = "-",
  micColor = "gray",

  playbackStatus = "等待音频",
  playbackColor = "gray",

  canConnect = false,
  canStartTalk = false,

  onConnect,
  onReset,
  onStartTalk,

  localReady = false,
  remoteReady = false,

  onCopyLocal,
  onPasteRemote,
  onViewLocal,
  onViewRemote,

  pasteError = "",

  metrics = {
    sentFrames: "-",
    recvFrames: "-",
    played: "-",
    buffered: "-",
  },

  logs = [],
  error = null,

  openedModal = null,
  onCloseModal,

  localJson = "",
  remoteJson = "",
}) {
  useEffect(() => {
    console.log("打开界面，启动节点...");

    return () => {
      console.log("离开界面，停止节点...");
    };
  }, []);

  return (
    <Container size="lg" py={{ base: 8, sm: 12 }}>
      <Paper shadow="xs" radius="lg" p={{ base: "sm", sm: "md" }} withBorder>
        <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="xs" mb="sm">
          <StatusBox label="网络" value={networkStatus} color={networkColor} />

          <StatusBox label="麦克风" value={micStatus} color={micColor} />

          <StatusBox
            label="播放"
            value={playbackStatus}
            color={playbackColor}
          />
        </SimpleGrid>

        <Paper withBorder p="xs" radius="md" mb="sm" bg="gray.0">
          <Group gap="xs" wrap="wrap">
            <Button
              size="xs"
              onClick={onConnect}
              disabled={!canConnect}
              color="green"
            >
              连接22
            </Button>

            <Button size="xs" onClick={onReset} color="red" variant="light">
              重置
            </Button>

            <Button
              size="xs"
              onClick={onStartTalk}
              disabled={!canStartTalk}
            >
              讲话
            </Button>
          </Group>
        </Paper>

        {pasteError && (
          <Alert color="red" mb="sm">
            {pasteError}
          </Alert>
        )}

        <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
          <AddressCard
            title="本地地址"
            active={localReady}
            onCopy={onCopyLocal}
            onView={onViewLocal}
          />

          <AddressCard
            title="远端地址"
            active={remoteReady}
            onPaste={onPasteRemote}
            onView={onViewRemote}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 2, sm: 4 }} mb="sm">
          <Metric label="发送帧" value={metrics.sentFrames} />

          <Metric label="接收帧" value={metrics.recvFrames} />

          <Metric label="播放" value={metrics.played} />

          <Metric label="缓冲" value={metrics.buffered} />
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
            {logs.length ? logs.join("\n") : "暂无日志"}
          </Box>
        </ScrollArea>

        {error && (
          <Alert color="red" mt="sm">
            错误: {error.message || String(error)}
          </Alert>
        )}
      </Paper>

      <Modal
        opened={openedModal === "local"}
        onClose={onCloseModal}
        title={
          <Text fw={700} ta="center" w="100%">
            本地地址
          </Text>
        }
        size="xl"
        radius="lg"
        centered
      >
        <JsonViewer json={localJson} />
      </Modal>

      <Modal
        opened={openedModal === "remote"}
        onClose={onCloseModal}
        title={
          <Text fw={700} ta="center" w="100%">
            远端地址
          </Text>
        }
        size="xl"
        radius="lg"
        centered
      >
        <JsonViewer json={remoteJson} />
      </Modal>
    </Container>
  );
}

function StatusBox({ label, value, color = "gray" }) {
  return (
    <Paper withBorder radius="md" p="xs">
      <Text size="10px" c="dimmed" mb={2}>
        {label}
      </Text>

      <Badge size="sm" color={color}>
        {value || "-"}
      </Badge>
    </Paper>
  );
}

function Metric({ label, value }) {
  return (
    <Paper withBorder radius="md" p="xs">
      <Text size="10px" c="dimmed" mb={2}>
        {label}
      </Text>

      <Text size="sm" fw={600}>
        {value ?? "-"}
      </Text>
    </Paper>
  );
}

function AddressCard({ title, active, onCopy, onPaste, onView }) {
  return (
    <Paper withBorder p="sm">
      <Group justify="space-between">
        <Text size="sm">{title}</Text>

        <Badge color={active ? "green" : "gray"}>
          {active ? "就绪" : "未就绪"}
        </Badge>
      </Group>

      <Group mt="xs">
        {onCopy && (
          <Button size="xs" onClick={onCopy}>
            复制
          </Button>
        )}

        {onPaste && (
          <Button size="xs" onClick={onPaste}>
            粘贴
          </Button>
        )}

        <Button size="xs" onClick={onView} disabled={!active}>
          查看
        </Button>
      </Group>
    </Paper>
  );
}

function JsonViewer({ json }) {
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
        {json || "暂无数据"}
      </Box>
    </ScrollArea>
  );
}