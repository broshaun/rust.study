import { useCallback, useMemo, useRef, useState } from "react";
import { Channel, invoke } from "@tauri-apps/api/core";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function concatInt16(a, b) {
  const out = new Int16Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export function useQuicPcmVoice(options = {}) {
  const {
    sampleRate = 48000,
    processorBufferSize = 512,
    frameSamples = 480,
    useJitterBuffer = true,
    minBufferFrames = 2,
    maxBufferFrames = 6,
    initialBindAddr = "0.0.0.0:0",
    initialRemoteAddr = "",
    initialServerName = "localhost",
  } = options;

  const streamRef = useRef(null);
  const captureContextRef = useRef(null);
  const playbackContextRef = useRef(null);
  const playbackQueueRef = useRef([]);
  const nextPlayTimeRef = useRef(0);
  const drainingRef = useRef(false);

  const captureCarryRef = useRef(new Int16Array(0));
  const sendQueueRef = useRef([]);
  const sendingRef = useRef(false);
  const downlinkChannelRef = useRef(null);

  const [bindAddr, setBindAddr] = useState(initialBindAddr);
  const [remoteAddr, setRemoteAddr] = useState(initialRemoteAddr);
  const [serverName, setServerName] = useState(initialServerName);

  const [quicStatus, setQuicStatus] = useState("未初始化");
  const [captureStatus, setCaptureStatus] = useState("未开始");
  const [playbackStatus, setPlaybackStatus] = useState("等待音频");

  const [initialized, setInitialized] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const [logs, setLogs] = useState([]);
  const [lastError, setLastError] = useState(null);
  const [metrics, setMetrics] = useState({
    sent: 0,
    recv: 0,
    played: 0,
    buffered: 0,
  });

  const appendLog = useCallback((text) => {
    setLogs((prev) => {
      const next = [...prev, `[${new Date().toLocaleTimeString()}] ${text}`];
      return next.slice(-200);
    });
  }, []);

  const playNext = useCallback(async () => {
    if (drainingRef.current) return;
    if (playbackQueueRef.current.length < (useJitterBuffer ? minBufferFrames : 1)) return;

    drainingRef.current = true;

    try {
      if (!playbackContextRef.current) {
        playbackContextRef.current = new AudioContext({
          sampleRate,
          latencyHint: "interactive",
        });
      }

      const ctx = playbackContextRef.current;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      setPlaybackStatus("播放中");

      while (playbackQueueRef.current.length > 0) {
        const bytes = playbackQueueRef.current.shift();
        const uint8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
        const int16 = new Int16Array(
          uint8.buffer,
          uint8.byteOffset,
          Math.floor(uint8.byteLength / 2)
        );
        const float32 = new Float32Array(int16.length);

        for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / 0x8000;
        }

        const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
        audioBuffer.copyToChannel(float32, 0);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);

        const now = ctx.currentTime;

        if (
          nextPlayTimeRef.current === 0 ||
          nextPlayTimeRef.current < now ||
          nextPlayTimeRef.current - now > 0.12
        ) {
          nextPlayTimeRef.current = now + 0.01;
        }

        source.start(nextPlayTimeRef.current);
        nextPlayTimeRef.current += audioBuffer.duration;

        setMetrics((prev) => ({
          ...prev,
          played: prev.played + 1,
          buffered: playbackQueueRef.current.length,
        }));
      }

      if (playbackQueueRef.current.length === 0) {
        setPlaybackStatus("等待音频");
      }
    } catch (e) {
      setPlaybackStatus("播放失败");
      setLastError(e);
      appendLog(`播放失败: ${e?.message || String(e)}`);
    } finally {
      drainingRef.current = false;
    }
  }, [appendLog, minBufferFrames, sampleRate, useJitterBuffer]);

  const flushSendQueue = useCallback(async () => {
    if (sendingRef.current) return;

    sendingRef.current = true;

    try {
      while (sendQueueRef.current.length > 0) {
        const packet = sendQueueRef.current.shift();

        await invoke("quic_send", { data: packet });

        setMetrics((prev) => ({
          ...prev,
          sent: prev.sent + 1,
        }));
      }
    } catch (e) {
      setLastError(e);
      appendLog(`发送失败: ${e?.message || String(e)}`);
    } finally {
      sendingRef.current = false;
      if (sendQueueRef.current.length > 0) {
        queueMicrotask(() => flushSendQueue());
      }
    }
  }, [appendLog]);

  const ensureDownlinkChannel = useCallback(() => {
    if (downlinkChannelRef.current) {
      return downlinkChannelRef.current;
    }

    const channel = new Channel();

    channel.onmessage = (message) => {
      const payload = message;
      let bytes;

      if (payload instanceof Uint8Array) {
        bytes = payload;
      } else if (Array.isArray(payload)) {
        bytes = new Uint8Array(payload);
      } else {
        bytes = new Uint8Array(payload || []);
      }

      playbackQueueRef.current.push(bytes);

      if (playbackQueueRef.current.length > maxBufferFrames) {
        playbackQueueRef.current.splice(
          0,
          playbackQueueRef.current.length - maxBufferFrames
        );
        nextPlayTimeRef.current = 0;
      }

      setMetrics((prev) => ({
        ...prev,
        recv: prev.recv + 1,
        buffered: playbackQueueRef.current.length,
      }));

      playNext();
    };

    downlinkChannelRef.current = channel;
    return channel;
  }, [maxBufferFrames, playNext]);

  const initNode = async () => {
    try {
      setQuicStatus("初始化中...");
      setLastError(null);

      const channel = ensureDownlinkChannel();

      await invoke("quic_init", {
        bindAddr,
        channel,
      });

      setInitialized(true);
      setQuicStatus("已初始化");
      appendLog(`初始化完成，bind=${bindAddr}`);
    } catch (e) {
      setQuicStatus("初始化失败");
      setLastError(e);
      appendLog(`初始化失败: ${e?.message || String(e)}`);
    }
  };

  const connectRemote = async () => {
    try {
      if (!remoteAddr) {
        throw new Error("请先填写远端地址");
      }

      setQuicStatus("连接中...");
      setConnected(false);
      setLastError(null);

      await invoke("quic_connect", {
        remote: remoteAddr,
        serverName,
      });

      await sleep(500);

      setConnected(true);
      setQuicStatus("已连接");
      appendLog(`连接成功，remote=${remoteAddr}, serverName=${serverName}`);
    } catch (e) {
      setConnected(false);
      setQuicStatus("连接失败");
      setLastError(e);
      appendLog(`连接失败: ${e?.message || String(e)}`);
    }
  };

  const startCapture = async () => {
    try {
      if (!initialized) {
        throw new Error("请先初始化");
      }

      if (!connected) {
        throw new Error("请先建立连接");
      }

      setCaptureStatus("开启麦克风...");
      setLastError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate,
          sampleSize: 16,
          latency: 0.02,
        },
        video: false,
      });

      const ctx = new AudioContext({
        sampleRate,
        latencyHint: "interactive",
      });

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(processorBufferSize, 1, 1);

      const mute = ctx.createGain();
      mute.gain.value = 0;

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const current = new Int16Array(input.length);

        for (let i = 0; i < input.length; i++) {
          current[i] = Math.max(-1, Math.min(1, input[i])) * 0x7fff;
        }

        let merged = concatInt16(captureCarryRef.current, current);

        while (merged.length >= frameSamples) {
          const frame = merged.slice(0, frameSamples);
          merged = merged.slice(frameSamples);
          const bytes = Array.from(new Uint8Array(frame.buffer));
          sendQueueRef.current.push(bytes);
        }

        captureCarryRef.current = merged;
        flushSendQueue();
      };

      source.connect(processor);
      processor.connect(mute);
      mute.connect(ctx.destination);

      streamRef.current = stream;
      captureContextRef.current = ctx;
      captureCarryRef.current = new Int16Array(0);

      setIsCapturing(true);
      setCaptureStatus("正在采集/推送");
      appendLog("麦克风增强已开启: echoCancellation / noiseSuppression / autoGainControl");
      appendLog("开始讲话");
    } catch (e) {
      setCaptureStatus("采集失败");
      setLastError(e);
      appendLog(`采集失败: ${e?.message || String(e)}`);
    }
  };

  const stopCapture = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (captureContextRef.current) {
        await captureContextRef.current.close();
        captureContextRef.current = null;
      }

      captureCarryRef.current = new Int16Array(0);
      sendQueueRef.current = [];
      sendingRef.current = false;

      setIsCapturing(false);
      setCaptureStatus("已停止");
      appendLog("停止讲话");
    } catch (e) {
      setLastError(e);
      appendLog(`停止采集失败: ${e?.message || String(e)}`);
    }
  }, [appendLog]);

  const closeNode = useCallback(async () => {
    try {
      await stopCapture();
      await invoke("quic_close");

      setConnected(false);
      setInitialized(false);
      setQuicStatus("已关闭");
      playbackQueueRef.current = [];
      nextPlayTimeRef.current = 0;
      appendLog("连接已关闭");
    } catch (e) {
      setLastError(e);
      appendLog(`关闭失败: ${e?.message || String(e)}`);
    }
  }, [appendLog, stopCapture]);

  const canConnect = useMemo(() => initialized && !!remoteAddr, [initialized, remoteAddr]);
  const canStartTalk = useMemo(() => initialized && connected && !isCapturing, [initialized, connected, isCapturing]);

  return {
    bindAddr,
    setBindAddr,
    remoteAddr,
    setRemoteAddr,
    serverName,
    setServerName,

    quicStatus,
    captureStatus,
    playbackStatus,
    logs,
    metrics,
    lastError,

    initialized,
    connected,
    isCapturing,

    canInit: !initialized,
    canConnect,
    canStartTalk,
    canStopTalk: isCapturing,

    initNode,
    connectRemote,
    startCapture,
    stopCapture,
    closeNode,
  };
}