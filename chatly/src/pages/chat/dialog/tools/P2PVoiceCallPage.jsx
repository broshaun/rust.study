import React, { useMemo, useState, useEffect } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Box,
  Badge,
  ActionIcon,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconPhone,
  IconPhoneOff,
  IconMicrophone,
  IconMicrophoneOff,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useP2PVoiceTransport } from "hooks/voice/useP2PVoiceTransport";
import { usePcmVoice } from "hooks/voice/usePcmVoice";




export function P2PVoiceCallPage() {



  const transport = useP2PVoiceTransport({
    maxPendingSends: 24,
  });

  const voice = usePcmVoice({
    sampleRate: 48000,
    frameSamples: 480,
    minBufferFrames: 3,
    maxBufferFrames: 12,
    sendPacket: transport.send,
    subscribePacket: transport.onMessage,
  });

  const navigate = useNavigate();

  const [inCall, setInCall] = useState(false);
  const [playbackStarted, setPlaybackStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);





  const metrics = voice?.metrics || {};

  // ⭐ 自动初始化 + 自动连接
  useEffect(() => {
    let mounted = true;

    const autoInit = async () => {
      try {
        if (!transport.initialized) {
          await transport.init();
        }

        if (transport.remoteAddrJson && !transport.connected) {
          await transport.connect();
        }

      } catch (e) {
        console.error("auto init error:", e);
      }
    };

    autoInit();

    return () => {
      mounted = false;
    };
  }, []);

  // ⭐ 退出组件时强制关闭（核心）
  useEffect(() => {
    return () => {
      (async () => {
        try {
          await voice.stopCapture();
        } catch { }

        try {
          await transport.close();
        } catch { }
      })();
    };
  }, []);

  useEffect(() => {
    if ((metrics.played ?? 0) > 0 || (metrics.recvFrames ?? 0) > 0) {
      setPlaybackStarted(true);
    }
  }, [metrics.played, metrics.recvFrames]);

  const networkColor = useMemo(() => {
    if (transport.connected) return "green";
    if (transport.initialized) return "blue";
    if (transport.status?.includes("初始化")) return "yellow";
    return "gray";
  }, [transport.connected, transport.initialized, transport.status]);

  const callStatus = useMemo(() => {
    if (muted) return "已静音";
    if (voice.isCapturing) return "你正在讲话";
    if (playbackStarted && speakerOn) return "对方正在讲话";
    if (!speakerOn) return "扬声器关闭";
    if (transport.connected) return "已连接";
    if (transport.initialized) return "已初始化";
    return "未初始化";
  }, [muted, voice.isCapturing, playbackStarted, speakerOn, transport.connected, transport.initialized]);

  const handleBack = () => {
    navigate("/chat/dialog");
  };

  const startCall = async () => {
    try {
      if (!transport.connected) {
        await transport.connect();
      }

      await voice.startCapture();
      setInCall(true);
    } catch (e) {
      console.error(e);
    }
  };

  const endCall = async () => {
    try {
      await voice.stopCapture();
      await transport.close();
    } catch (e) {
      console.error(e);
    }

    setInCall(false);
    setPlaybackStarted(false);
  };

  const toggleMute = async () => {
    if (!muted) {
      await voice.stopCapture();
      setMuted(true);
    } else {
      await voice.startCapture();
      setMuted(false);
    }
  };

  const toggleSpeaker = () => {
    if (speakerOn) {
      voice.resetPlayback?.();
      setSpeakerOn(false);
    } else {
      setSpeakerOn(true);
    }
  };

  return (
    <Container size="sm" py="lg">
      <Paper shadow="sm" radius="xl" p="lg" withBorder>
        <Group justify="space-between" mb="md">
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="xl"
            onClick={handleBack}
          >
            <IconArrowLeft size={20} stroke={2} />
          </ActionIcon>

          <Title order={4}>语音通话</Title>

          <Badge color={networkColor}>
            {transport.connected
              ? "已连接"
              : transport.initialized
                ? "已初始化"
                : "未初始化"}
          </Badge>
        </Group>

        <Box
          py="xl"
          style={{
            borderRadius: 20,
            background: transport.connected
              ? "#d3f9d8"
              : transport.initialized
                ? "#e7f5ff"
                : "#e9ecef",
          }}
        >
          <Stack align="center">
            <Box
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: transport.connected ? "#e7f5ff" : "#e9ecef",
              }}
            >
              <ThemeIcon
                size={50}
                radius="xl"
                color={
                  muted
                    ? "gray"
                    : voice.isCapturing
                      ? "green"
                      : transport.connected
                        ? "green"
                        : transport.initialized
                          ? "blue"
                          : "gray"
                }
                variant="light"
              >
                {muted ? (
                  <IconMicrophoneOff size={26} />
                ) : voice.isCapturing ? (
                  <IconMicrophone size={26} />
                ) : (
                  <IconPhone size={26} />
                )}
              </ThemeIcon>
            </Box>

            <Text fw={600}>对方设备</Text>

            <Text size="sm" c="dimmed">
              {callStatus}
            </Text>
          </Stack>
        </Box>

        {inCall && (
          <Group justify="center" mt="lg" gap="xl">
            <ActionIcon
              size="xl"
              radius="xl"
              variant={muted ? "filled" : "light"}
              color={muted ? "red" : "blue"}
              onClick={toggleMute}
            >
              {muted ? (
                <IconMicrophoneOff size={20} />
              ) : (
                <IconMicrophone size={20} />
              )}
            </ActionIcon>

            <ActionIcon
              size="xl"
              radius="xl"
              variant={!speakerOn ? "filled" : "light"}
              color={!speakerOn ? "red" : "blue"}
              onClick={toggleSpeaker}
            >
              {!speakerOn ? (
                <IconVolumeOff size={20} />
              ) : (
                <IconVolume size={20} />
              )}
            </ActionIcon>
          </Group>
        )}

        <Group justify="center" mt="xl">
          {!inCall ? (
            <Button
              size="lg"
              radius="xl"
              color="green"
              onClick={startCall}
              leftSection={<IconPhone size={18} />}
            >
              开始通话
            </Button>
          ) : (
            <Button
              size="lg"
              radius="xl"
              color="red"
              onClick={endCall}
              leftSection={<IconPhoneOff size={18} />}
            >
              结束通话
            </Button>
          )}
        </Group>
      </Paper>
    </Container>
  );
}