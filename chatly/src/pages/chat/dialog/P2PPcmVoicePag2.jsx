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
import { useP2PPcmVoice } from "hooks/voice/useP2PPcmVoice";
import { useNavigate } from "react-router";

export function P2PPcmVoicePage({ useJitterBuffer = true }) {
  const v = useP2PPcmVoice({ useJitterBuffer });

  const [parsedRemoteAddr, setParsedRemoteAddr] = useState(null);
  const [pasteError, setPasteError] = useState("");
  const [openedModal, setOpenedModal] = useState(null);
  const navigate = useNavigate();

  const localRows = useMemo(() => {
    if (!v.localAddrJson) return [];
    try {
      return flattenObjectToRows(JSON.parse(v.localAddrJson));
    } catch {
      return [];
    }
  }, [v.localAddrJson]);

  const remoteRows = useMemo(() => {
    if (!parsedRemoteAddr) return [];
    return flattenObjectToRows(parsedRemoteAddr);
  }, [parsedRemoteAddr]);

  const handlePasteFromClipboard = async () => {
    try {
      setPasteError("");
      setParsedRemoteAddr(null);

      const text = await navigator.clipboard.readText();

      if (!text || !text.trim()) {
        setPasteError("剪贴板为空");
        return;
      }

      v.setRemoteAddrJson(text);

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
          <StatusBox label="网络" value={v.p2pStatus} active={v.connected} />
          <StatusBox label="麦克风" value={v.captureStatus} active={v.isCapturing} />
          <StatusBox label="播放" value={v.playbackStatus} />
        </SimpleGrid>

        <Paper withBorder p="xs" radius="md" mb="sm" bg="gray.0">
          <Group gap="xs" wrap="wrap">
            <Button size="xs" radius="md" onClick={v.initNode} disabled={!v.canInit}>
              启动
            </Button>

            <Button
              size="xs"
              radius="md"
              onClick={v.connectRemote}
              disabled={!v.canConnect}
              color="green"
            >
              连接
            </Button>

            <Button
              size="xs"
              radius="md"
              onClick={v.closeNode}
              color="red"
              variant="light"
            >
              重置
            </Button>

            <Button
              size="xs"
              radius="md"
              onClick={v.startCapture}
              disabled={!v.canStartTalk}
            >
              讲话
            </Button>

            <Button
              size="xs"
              radius="md"
              onClick={v.stopCapture}
              disabled={!v.canStopTalk}
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
            active={localRows.length > 0}
            onCopy={v.copyLocalAddr}
            onView={() => setOpenedModal("local")}
          />

          <AddressCard
            title="远端地址"
            active={remoteRows.length > 0}
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
          <Metric label="发送" value={v.metrics.sent} />
          <Metric label="接收" value={v.metrics.recv} />
          <Metric label="播放" value={v.metrics.played} />
          <Metric label="缓冲" value={v.metrics.buffered} />
          <Metric label="时间" value={v.callDurationSeconds} suffix="s" />
          <Metric label="延迟" value={v.metrics.avgTransitMs} suffix="ms" />
        </SimpleGrid>

        <Divider mb="xs" />
        <Text fw={600} size="sm" mb={6}>
          运行日志
        </Text>

        <ScrollArea h={150}>
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
            {v.logs?.length ? v.logs.join("\n") : "暂无日志"}
          </Box>
        </ScrollArea>

        {v.lastError && (
          <Alert color="red" mt="sm" p="xs" radius="md">
            错误提示: {v.lastError.message || String(v.lastError)}
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
        <JsonViewer json={v.localAddrJson} />
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
        <JsonViewer json={v.remoteAddrJson} />
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
        {hasValue ? `${value}${value === 0 ? "" : suffix}` : "-"}
      </Text>
    </Paper>
  );
}

function flattenObjectToRows(obj, parent = "") {
  const rows = [];

  for (const [k, v] of Object.entries(obj)) {
    const key = parent ? `${parent}.${k}` : k;

    if (Array.isArray(v)) {
      if (v.length === 0) {
        rows.push({ key, value: "[]" });
      } else {
        v.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            rows.push(...flattenObjectToRows(item, `${key}[${index}]`));
          } else {
            rows.push({ key: `${key}[${index}]`, value: String(item) });
          }
        });
      }
    } else if (typeof v === "object" && v !== null) {
      rows.push(...flattenObjectToRows(v, key));
    } else {
      rows.push({ key, value: String(v) });
    }
  }

  return rows;
}