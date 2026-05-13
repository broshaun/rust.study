import React, { useState, useEffect } from "react";
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
  Modal
} from "@mantine/core";
import { invoke, Channel } from "@tauri-apps/api/core";

import { usePcmCapture } from "hooks/hook/usePcmCapture";
import { usePcmPlayback } from "hooks/hook/usePcmPlayback";

export function P2PPcmVoiceTest() {
  const p2p_playback = usePcmPlayback({
    sampleRate: 48000,
    frameSamples: 480,
    defaultPlaying: false,
  });

  const p2p_capture = usePcmCapture({
    sampleRate: 48000,
    frameSamples: 480,
    onData: (bytes) => {
      void invoke("p2p_send", {
        data: Array.from(bytes),
      }).catch(console.error);
    },
  });

  const [parsedRemoteAddr, setParsedRemoteAddr] = useState(null);
  const [pasteError, setPasteError] = useState("");
  const [openedModal, setOpenedModal] = useState(null);
  const [localAddrJson, setLocalAddrJson] = useState("");
  const [remoteAddrJson, setRemoteAddrJson] = useState("");
  const [logs, setLogs] = useState([]);
  const [nodeStatus, setNodeStatus] = useState("Idle");

  const addLog = (text) => {
    console.log(text);
    setLogs((prev) => [...prev, String(text)].slice(-300));
  };

  useEffect(() => {
    addLog("打开界面，启动节点...");

    const onData = new Channel();

    onData.onmessage = (data) => {
      console.log("当前节点状态", data);
      setNodeStatus(String(data || "Idle"));
    };

    void invoke("p2p_start")
      .then(async (rsp) => {
        addLog(rsp);

        return invoke("p2p_state", { onData });
      })
      .then((rsp) => {
        console.log(rsp);
        addLog("节点状态监听已启动");
      })
      .catch((err) => {
        console.error(err);
        addLog(err);
        setNodeStatus("Disconnected");
      });

    return () => {
      console.log("离开界面，停止节点...");

      void invoke("p2p_stop")
        .then((rsp) => {
          console.log(rsp);
        })
        .catch(console.error);
    };
  }, []);

  const localReady = !!localAddrJson;
  const remoteReady = !!parsedRemoteAddr;

  const isIdle = nodeStatus.includes("Idle");
  const isCalling = nodeStatus.includes("Calling");
  const isConnected = nodeStatus.includes("Connected");
  const isDisconnected = nodeStatus.includes("Disconnected");

  const nodeColor = isConnected
    ? "green"
    : isCalling
      ? "yellow"
      : isDisconnected
        ? "red"
        : "gray";

  const nodeStatusText = isIdle
    ? "空闲"
    : isCalling
      ? "呼叫中"
      : isConnected
        ? "已连通"
        : isDisconnected
          ? "已断开"
          : nodeStatus;

  const micColor = p2p_capture.isCapturing ? "green" : "gray";
  const playbackColor = p2p_playback.isPlayingEnabled ? "green" : "gray";
  const displayPlaybackStatus = p2p_playback.status;

  const getLocalTicket = async () => {
    try {
      const rsp = await invoke("p2p_get_ticket");
      console.log(rsp);

      const ticket = String(rsp || "");
      setLocalAddrJson(ticket);
      return ticket;
    } catch (err) {
      console.error(err);
      addLog(err);
      return "";
    }
  };

  const handleViewLocalAddr = async () => {
    await getLocalTicket();
    setOpenedModal("local");
  };

  const handleCopyLocalAddr = async () => {
    try {
      const ticket = await getLocalTicket();

      if (!ticket.trim()) {
        addLog("本地地址为空，复制失败");
        return;
      }

      await navigator.clipboard.writeText(ticket);
      addLog("点击：复制本地地址");
    } catch (err) {
      console.error(err);
      addLog("复制本地地址失败");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      setPasteError("");
      setParsedRemoteAddr(null);

      const text = await navigator.clipboard.readText();

      if (!text || !text.trim()) {
        setPasteError("剪贴板为空");
        return;
      }

      setRemoteAddrJson(text);

      try {
        setParsedRemoteAddr(JSON.parse(text));
      } catch {
        setParsedRemoteAddr(text);
      }
    } catch {
      setPasteError("无法读取剪贴板");
    }
  };

  const handleCall = async () => {
    addLog("点击：呼叫");

    const onData = new Channel();

    onData.onmessage = (data) => {
      p2p_playback.pushBytes(data);
    };

    try {
      addLog("📡 建立接收通道...");

      const rsp = await invoke("p2p_start_accept", {
        onData,
      });

      addLog(rsp);
    } catch (err) {
      console.error(err);
      addLog(err);
    }
  };

  const handleConnect = async () => {
    addLog("点击：接通");

    if (!remoteAddrJson.trim()) {
      setPasteError("远端地址为空");
      return;
    }

    const onData = new Channel();

    onData.onmessage = (data) => {
      p2p_playback.pushBytes(data);
    };

    try {
      addLog("📡 建立接收通道...");

      const rsp = await invoke("p2p_start_connect", {
        addr: remoteAddrJson,
        onData,
      });

      addLog(rsp);
    } catch (err) {
      console.error(err);
      addLog(err);
    }
  };

  const handleTalk = async () => {
    addLog("点击：讲话");

    try {
      await p2p_capture.startCapture();
    } catch (err) {
      console.error(err);
      addLog(err);
    }
  };

  const handleSilent = async () => {
    addLog("点击：静默");

    try {
      await p2p_capture.stopCapture();
    } catch (err) {
      console.error(err);
      addLog(err);
    }
  };

  const handlePlay = () => {
    addLog("点击：播放");
    p2p_playback.start();
  };

  const handleMute = async () => {
    addLog("点击：静音");

    try {
      await p2p_playback.stop();
    } catch (err) {
      console.error(err);
      addLog(err);
    }
  };

  const mergedError = p2p_capture.error || p2p_playback.error;

  return (
    <Container size="lg" py={{ base: 8, sm: 12 }}>
      <Paper shadow="xs" radius="lg" p={{ base: "sm", sm: "md" }} withBorder>
        <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="xs" mb="sm">
          <StatusBox label="节点" value={nodeStatusText} color={nodeColor} />
          <StatusBox label="麦克风" value={p2p_capture.status} color={micColor} />
          <StatusBox label="播放" value={displayPlaybackStatus} color={playbackColor} />
        </SimpleGrid>

        <Paper withBorder p="xs" radius="md" mb="sm" bg="gray.0">
          <Group gap="xs" wrap="wrap">
            <Button
              size="xs"
              onClick={handleCall}
              color="red"
              variant="light"
            >
              呼叫
            </Button>

            <Button
              size="xs"
              onClick={handleConnect}
              color="green"
              disabled={!remoteAddrJson.trim()}
            >
              接通
            </Button>

            <Button
              size="xs"
              onClick={handleTalk}
              disabled={p2p_capture.isCapturing}
            >
              讲话
            </Button>

            <Button
              size="xs"
              onClick={handleSilent}
              color="gray"
              variant="light"
              disabled={!p2p_capture.isCapturing}
            >
              静默
            </Button>

            <Button
              size="xs"
              onClick={handlePlay}
              color="blue"
              variant="light"
              disabled={p2p_playback.isPlayingEnabled}
            >
              播放
            </Button>

            <Button
              size="xs"
              onClick={handleMute}
              color="yellow"
              variant="light"
              disabled={!p2p_playback.isPlayingEnabled}
            >
              静音
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
            onCopy={handleCopyLocalAddr}
            onView={handleViewLocalAddr}
          />

          <AddressCard
            title="远端地址"
            active={remoteReady}
            onPaste={handlePasteFromClipboard}
            onView={() => setOpenedModal("remote")}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 2, sm: 4 }} mb="sm">
          <Metric label="发送帧" value={0} />
          <Metric label="接收帧" value={0} />
          <Metric label="播放" value={0} />
          <Metric label="缓冲" value={0} />
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

        {mergedError && (
          <Alert color="red" mt="sm">
            错误: {mergedError.message || String(mergedError)}
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
        <JsonViewer json={localAddrJson} />
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
        <JsonViewer json={remoteAddrJson} />
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

        <Button size="xs" onClick={onView}>
          查看
        </Button>
      </Group>
    </Paper>
  );
}

function JsonViewer({ json }) {
  let displayText = "暂无数据";

  if (json && String(json).trim()) {
    try {
      displayText = JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      displayText = String(json);
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