import React, { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Center,
  Container,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPhoneCall,
  IconPhoneOff,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { Channel, invoke } from "@tauri-apps/api/core";

import { usePcmCapture } from "utils";
import { usePcmPlayback } from "utils";

const STATE_UI = {
  Idle: {
    text: "空闲",
    color: "gray",
    desc: "等待发起语音通话",
    bg: "linear-gradient(135deg,#f1f3f5,#ffffff)",
    shadow: "0 0 0 18px rgba(134,142,150,.08)",
  },
  Calling: {
    text: "呼叫中",
    color: "yellow",
    desc: "正在等待对方接入...",
    bg: "linear-gradient(135deg,#fff3bf,#fff9db)",
    shadow: "0 0 0 18px rgba(252,196,25,.12)",
  },
  Connected: {
    text: "已连通",
    color: "green",
    desc: "",
    bg: "linear-gradient(135deg,#d3f9d8,#ebfbee)",
    shadow: "0 0 0 18px rgba(64,192,87,.12)",
  },
  Disconnected: {
    text: "已断开",
    color: "red",
    desc: "当前连接已断开",
    bg: "linear-gradient(135deg,#ffe3e3,#fff5f5)",
    shadow: "0 0 0 18px rgba(250,82,82,.10)",
  },
};

function formatCallTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  return h > 0 ? `${String(h).padStart(2, "0")}:${mm}:${ss}` : `${mm}:${ss}`;
}

function createAudioChannel(playback) {
  const onData = new Channel();

  onData.onmessage = (data) => {
    playback.pushBytes(data);
  };

  return onData;
}

export function P2PCallCaller({ onTicket, avatar, name = "Unknown User" }) {
  const playback = usePcmPlayback({
    sampleRate: 48000,
    frameSamples: 480,
    defaultPlaying: false,
  });

  const capture = usePcmCapture({
    sampleRate: 48000,
    frameSamples: 480,
    onData: (bytes) => {
      void invoke("p2p_send", {
        data: Array.from(bytes),
      }).catch(console.error);
    },
  });

  const [nodeStatus, setNodeStatus] = useState("Idle");
  const [callSeconds, setCallSeconds] = useState(0);

  

  const ui = STATE_UI[nodeStatus] || {
    text: nodeStatus,
    color: "gray",
    desc: "未知状态",
    bg: STATE_UI.Idle.bg,
    shadow: STATE_UI.Idle.shadow,
  };

  const canStartCall = nodeStatus === "Idle" || nodeStatus === "Disconnected";

  const statusDesc = useMemo(() => {
    if (nodeStatus === "Connected") return formatCallTime(callSeconds);
    return ui.desc;
  }, [nodeStatus, callSeconds, ui.desc]);

  useEffect(() => {
    const onData = new Channel();

    onData.onmessage = (data) => {
      const nextStatus = String(data || "Idle");
      console.log("P2P 状态更新:", nextStatus);
      setNodeStatus(nextStatus);
    };

    invoke("p2p_start")
      .then((rsp) => {
        console.log("p2p_start:", rsp);
        return invoke("p2p_state", { onData });
      })
      .then((rsp) => {
        console.log("p2p_state:", rsp);
      })
      .catch((err) => {
        console.error("P2P 启动失败:", err);
      });

    return () => {
      console.log("离开发起通话界面");

      void capture.stopCapture().catch(console.error);
      void playback.stop().catch(console.error);
      void invoke("p2p_stop").catch(console.error);
    };
  }, []);

  useEffect(() => {
    if (nodeStatus !== "Connected") {
      setCallSeconds(0);
      return;
    }

    const timer = window.setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [nodeStatus]);

  const handleStartCall = async () => {
    try {
      console.log("点击：发起通话");

      const ticket = String((await invoke("p2p_get_ticket")) || "");
      console.log("p2p_get_ticket:", ticket);

      onTicket?.(ticket);

      const rsp = await invoke("p2p_start_accept", {
        onData: createAudioChannel(playback),
      });

      console.log("p2p_start_accept:", rsp);

      playback.start();
      await capture.startCapture();
    } catch (err) {
      console.error("发起通话失败:", err);
    }
  };

  const handleHangup = async () => {
    try {
      console.log("点击：挂断");
      await capture.stopCapture();
      await playback.stop();
      await invoke("p2p_stop");

      
    } catch (err) {
      console.error("挂断失败:", err);
    }
  };

  const handleMicToggle = async () => {
    try {
      const shouldStop = capture.isCapturing;

      if (shouldStop) {
        await capture.stopCapture();
        console.log("麦克风已关闭");
      } else {
        await capture.startCapture();
        console.log("麦克风已开启");
      }

    } catch (err) {
      console.error("麦克风切换失败:", err);
    }
  };

  const handleSpeakerToggle = async () => {
    try {
      const shouldStop = playback.isPlayingEnabled;

      if (shouldStop) {
        await playback.stop();
        console.log("扬声器已关闭");
      } else {
        playback.start();
        console.log("扬声器已开启");
      }
    } catch (err) {
      console.error("扬声器切换失败:", err);
    }
  };

  return (
    <Container size={360} py="xs">
      <Paper
        radius="lg"
        p="md"
        withBorder
        shadow="xs"
        style={{
          minHeight: 520,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Group justify="space-between">
          <Text fw={700} size="md">
            实时语音通话
          </Text>

          <Badge color={ui.color} variant="light" size="md">
            {ui.text}
          </Badge>
        </Group>

        <Stack align="center" gap="md">
          <Center
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: ui.bg,
              boxShadow: ui.shadow,
              transition: "all .25s ease",
            }}
          >
            <Avatar src={avatar} radius="50%" size={122}>
              {name?.[0]}
            </Avatar>
          </Center>

          <Stack gap={2} align="center">
            <Text fw={700} size="lg">
              {name}
            </Text>

            <Text size="sm" c="dimmed" ta="center">
              {statusDesc}
            </Text>
          </Stack>
        </Stack>

        <Group justify="center" gap="lg">
          <ActionIcon
            size={54}
            radius="xl"
            color={capture.isCapturing ? "green" : "gray"}
            variant={capture.isCapturing ? "filled" : "light"}
            onClick={handleMicToggle}
          >
            {capture.isCapturing ? (
              <IconMicrophone size={25} />
            ) : (
              <IconMicrophoneOff size={25} />
            )}
          </ActionIcon>

          <ActionIcon
            size={74}
            radius="xl"
            color={canStartCall ? "green" : "red"}
            onClick={canStartCall ? handleStartCall : handleHangup}
          >
            {canStartCall ? (
              <IconPhoneCall size={34} />
            ) : (
              <IconPhoneOff size={34} />
            )}
          </ActionIcon>

          <ActionIcon
            size={54}
            radius="xl"
            color={playback.isPlayingEnabled ? "blue" : "gray"}
            variant={playback.isPlayingEnabled ? "filled" : "light"}
            onClick={handleSpeakerToggle}
          >
            {playback.isPlayingEnabled ? (
              <IconVolume size={25} />
            ) : (
              <IconVolumeOff size={25} />
            )}
          </ActionIcon>
        </Group>
      </Paper>
    </Container>
  );
}