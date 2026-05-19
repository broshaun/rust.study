import { useEffect, useState } from "react";
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
import { invoke, Channel } from "@tauri-apps/api/core";
import { usePcmCapture, usePcmPlayback } from "utils";


const STATE_UI = {
  Idle: ["就绪", "blue", "等待发起语音通话"],
  Calling: ["呼叫中", "yellow", ""],
  Connected: ["已连通", "green", ""],
  Disconnected: ["已断开", "red", "当前连接已断开"],
};

const formatTime = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

function CircleButton({
  active,
  onClick,
  ActiveIcon,
  InactiveIcon,
  activeColor,
  inactiveColor = "gray",
  size = 54,
  iconSize = 25,
}) {
  const Icon = active ? ActiveIcon : InactiveIcon;

  return (
    <ActionIcon
      size={size}
      radius="xl"
      color={active ? activeColor : inactiveColor}
      variant={active ? "filled" : "light"}
      onClick={onClick}
    >
      <Icon size={iconSize} />
    </ActionIcon>
  );
}

export function P2PCallCaller({
  avatar,
  name = "Unknown User",
  onStartCall,
  onStopCall,
}) {

  const [nodeStatus, setNodeStatus] = useState("Idle");
  const [seconds, setSeconds] = useState(0);
  const [text, color, defaultDesc] = STATE_UI[nodeStatus] || STATE_UI.Idle;
  const isInCall = nodeStatus === "Calling" || nodeStatus === "Connected";



  const initCall = async () => {
    const onData = new Channel();
    onData.onmessage = (data) => {
      const status = String(data);
      console.log("当前节点状态", status);
      setNodeStatus(status);
    };

    try {
      const startRsp = await invoke("p2p_start");
      console.log("启动节点:", startRsp);
      const stateRsp = await invoke("p2p_state", { onData });
      console.log("启动节点状态监听:", stateRsp);
    } catch (err) {
      console.error("启动节点失败:", err);
    }
  };

  const stopCall = async () => {
    try {
      const stopRsp = await invoke("p2p_stop");
      console.log("关闭节点:", stopRsp);
    } catch (err) {
      console.error("关闭节点失败:", err);
    } finally {
      onStopCall?.()
    }
  };


  useEffect(() => {
    console.log("打开界面，启动节点...");
    initCall().catch((err) => console.error(err));
  }, []);



  useEffect(() => {
    if (!isInCall) {
      setSeconds(0);
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isInCall]);

  useEffect(() => {
    if (nodeStatus === "Calling" && seconds >= 60) {
      onStopCall?.();
    }
  }, [nodeStatus, seconds, onStopCall]);



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


  const handleTalk = async () => {
    console.log("点击：讲话");

    try {
      const shouldStop = p2p_capture.isCapturing;
      if (shouldStop) {
        await p2p_capture.stopCapture();
        console.log("麦克风已关闭");
      } else {
        await p2p_capture.startCapture();
        console.log("麦克风已开启");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSilent = async () => {
    console.log("点击：静默");
    try {
      const shouldStop = p2p_playback.isPlayingEnabled;
      if (shouldStop) {
        await p2p_playback.stop();
        console.log("扬声器已关闭");
      } else {
        p2p_playback.start();
        console.log("扬声器已开启");
      }
    } catch (err) {
      console.error(err);
    }
  };


  const startCall = async () => {
    console.log("点击：呼叫");
    const ticket = await invoke("p2p_get_ticket");
    onStartCall?.(ticket);

    const onData = new Channel();
    onData.onmessage = (data) => {
      p2p_playback.pushBytes(data);
    };

    try {
      console.log("📡 建立接收通道...");
      const rsp = await invoke("p2p_start_accept", { onData });
      console.log(rsp);
    } catch (err) {
      console.error(err);
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
          <Badge color={color} variant="light" size="md">
            {text}
          </Badge>
        </Group>

        <Stack align="center" gap="md">
          <Center
            w={160}
            h={160}
            style={{
              borderRadius: "50%",
              background: "linear-gradient(135deg,#f1f3f5,#ffffff)",
              boxShadow: "0 0 0 18px rgba(134,142,150,.08)",
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
              {isInCall ? formatTime(seconds) : defaultDesc}
            </Text>
          </Stack>
        </Stack>

        <Group justify="center" gap="lg">
          <CircleButton
            active={p2p_capture.isCapturing}
            activeColor="green"
            onClick={handleTalk}
            ActiveIcon={IconMicrophone}
            InactiveIcon={IconMicrophoneOff}
          />

          <CircleButton
            active={isInCall}
            activeColor="red"
            inactiveColor="green"
            onClick={isInCall ? stopCall : startCall}
            ActiveIcon={IconPhoneOff}
            InactiveIcon={IconPhoneCall}
            size={74}
            iconSize={34}
          />

          <CircleButton
            active={p2p_playback.isPlayingEnabled}
            activeColor="blue"
            onClick={handleSilent}
            ActiveIcon={IconVolume}
            InactiveIcon={IconVolumeOff}
          />
        </Group>
      </Paper>
    </Container>
  );
}