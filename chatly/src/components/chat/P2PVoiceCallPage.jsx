import React, { useMemo, useState, useEffect, useRef } from "react";
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

import { useP2PVoiceTransport } from "hooks/voice/useP2PVoiceTransport";
import { usePcmVoice } from "hooks/voice/usePcmVoice";

export function P2PVoiceCallPage() {
  const [resetSeed, setResetSeed] = useState(0);

  return (
    <Inner
      key={resetSeed}
      onHardReset={() => setResetSeed((v) => v + 1)}
    />
  );
}

function Inner({ onHardReset }) {
  const transport = useP2PVoiceTransport({
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
  const [playbackStarted, setPlaybackStarted] = useState(false);

  // 🔴 关键：保存麦克风 stream
  const micStreamRef = useRef(null);

  useEffect(() => {
    if (voice.metrics.played > 0) {
      setPlaybackStarted(true);
    }
  }, [voice.metrics.played]);

  const localReady = !!transport.localAddrJson;
  const remoteReady = !!parsedRemoteAddr;

  const handlePaste = async () => {
    try {
      setPasteError("");
      const text = await navigator.clipboard.readText();

      const parsed = JSON.parse(text);
      setParsedRemoteAddr(parsed);

      transport.setRemoteAddrJson(text);
      setPlaybackStarted(false);
    } catch {
      setPasteError("粘贴失败 / JSON错误");
    }
  };

  // ✅ 开始讲话（记录 stream）
  const handleStart = async () => {
    try {
      if (!transport.connected) {
        await transport.connect();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      micStreamRef.current = stream;

      await voice.startCapture(stream);
    } catch (e) {
      console.error(e);
      setPasteError("启动麦克风失败");
    }
  };

  // =========================
  // ✅🔥 强制停止麦克风（关键修复）
  // =========================
  const handleStop = async () => {
    try {
      setPasteError("");

      // 1️⃣ 停止 hook 内部
      await voice.stopCapture();

      // 2️⃣ 强制关闭所有音轨
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        micStreamRef.current = null;
      }

      // 3️⃣ 保险：清空发送（防止还在发包）
      transport.send = () => {};

    } catch (e) {
      console.error("硬停止失败:", e);
      setPasteError("停止失败");
    }
  };

  const handleReset = async () => {
    try {
      await handleStop();
      await transport.close();
    } catch {}

    setPlaybackStarted(false);
    setParsedRemoteAddr(null);
    setOpenedModal(null);

    onHardReset?.();
  };

  return (
    <Container size="lg">
      <Paper p="md" withBorder>

        <SimpleGrid cols={3} mb="sm">
          <Badge color={transport.connected ? "green" : "gray"}>
            网络
          </Badge>
          <Badge color={voice.isCapturing ? "green" : "gray"}>
            麦克风
          </Badge>
          <Badge color={playbackStarted ? "green" : "gray"}>
            播放
          </Badge>
        </SimpleGrid>

        <Group mb="sm">
          <Button onClick={transport.init}>启动</Button>
          <Button onClick={transport.connect}>连接</Button>

          <Button onClick={handleStart} disabled={!remoteReady}>
            讲话
          </Button>

          <Button color="red" onClick={handleStop}>
            🔴 强制停止
          </Button>

          <Button variant="light" onClick={handleReset}>
            重置
          </Button>
        </Group>

        {pasteError && <Alert color="red">{pasteError}</Alert>}

        <Group mb="sm">
          <Button onClick={transport.copyLocalAddr}>复制本地</Button>
          <Button onClick={handlePaste}>粘贴远端</Button>
        </Group>

        <Divider my="sm" />

        <ScrollArea h={200}>
          <Box
            style={{
              background: "#111",
              color: "#0f0",
              fontSize: 11,
              padding: 10,
              borderRadius: 8,
            }}
          >
            {(voice.logs || []).slice(-100).join("\n")}
          </Box>
        </ScrollArea>
      </Paper>
    </Container>
  );
}