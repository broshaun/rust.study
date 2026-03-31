import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Channel, invoke } from "@tauri-apps/api/core";

export function useQuicPcmVoice(options = {}) {
  const {
    sampleRate = 48000,
    processorBufferSize = 2048,
    frameChunkSize = 512,
    initialBindAddr = "0.0.0.0:6000",
    initialRemoteAddr = "127.0.0.1:6001",
    initialServerName = "localhost",
    useJitterBuffer = true,
    minBufferFrames = 4,
  } = options;

  // --- Refs ---
  const streamRef = useRef(null);
  const captureContextRef = useRef(null);
  const playbackContextRef = useRef(null);
  const playbackQueueRef = useRef([]);
  const nextPlayTimeRef = useRef(0);
  const drainingRef = useRef(false);

  // --- States ---
  const [bindAddr, setBindAddr] = useState(initialBindAddr);
  const [remoteAddr, setRemoteAddr] = useState(initialRemoteAddr);
  const [serverName, setServerName] = useState(initialServerName);

  const [quicStatus, setQuicStatus] = useState("未初始化");
  const [captureStatus, setCaptureStatus] = useState("未开始");
  const [playbackStatus, setPlaybackStatus] = useState("等待音频");
  
  const [nodeStarted, setNodeStarted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const [metrics, setMetrics] = useState({ sent: 0, recv: 0, played: 0, buffered: 0 });
  const [lastError, setLastError] = useState(null);

  // --- 播放逻辑 ---
  const playNext = useCallback(async () => {
    if (drainingRef.current || playbackQueueRef.current.length < (useJitterBuffer ? minBufferFrames : 1)) return;
    drainingRef.current = true;

    if (!playbackContextRef.current) {
      playbackContextRef.current = new AudioContext({ sampleRate });
    }
    const ctx = playbackContextRef.current;
    if (ctx.state === "suspended") await ctx.resume();

    while (playbackQueueRef.current.length > 0) {
      const bytes = playbackQueueRef.current.shift();
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 0x8000;

      const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
      audioBuffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      nextPlayTimeRef.current = Math.max(nextPlayTimeRef.current, now + 0.02);
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;

      setMetrics(prev => ({ ...prev, played: prev.played + 1, buffered: playbackQueueRef.current.length }));
    }
    drainingRef.current = false;
  }, [sampleRate, useJitterBuffer, minBufferFrames]);

  // --- 核心操作 ---
  const initNode = async () => {
    try {
      setQuicStatus("正在启动...");
      const downlink = new Channel();
      downlink.onmessage = (msg) => {
        const bytes = msg instanceof Uint8Array ? msg : new Uint8Array(msg);
        playbackQueueRef.current.push(bytes);
        setMetrics(prev => ({ ...prev, recv: prev.recv + 1, buffered: playbackQueueRef.current.length }));
        playNext();
      };

      await invoke("quic_init", { bindAddr, channel: downlink });
      setNodeStarted(true);
      setQuicStatus("节点已就绪");
    } catch (e) {
      setQuicStatus("启动失败");
      setLastError(e);
    }
  };

  const connectRemote = async () => {
    try {
      setQuicStatus("连接中...");
      await invoke("quic_connect", { remote: remoteAddr, serverName });
      setConnected(true);
      setQuicStatus("已连接远端");
    } catch (e) {
      setQuicStatus("连接失败");
      setLastError(e);
    }
  };

  const startCapture = async () => {
    try {
      setCaptureStatus("开启麦克风...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false
      });

      const ctx = new AudioContext({ sampleRate });
      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(processorBufferSize, 1, 1);
      
      // 静音本地回放
      const mute = ctx.createGain();
      mute.gain.value = 0;

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          int16[i] = Math.max(-1, Math.min(1, input[i])) * 0x7FFF;
        }

        for (let i = 0; i < int16.length; i += frameChunkSize) {
          const chunk = int16.slice(i, i + frameChunkSize);
          invoke("quic_send", { data: Array.from(new Uint8Array(chunk.buffer)) });
          setMetrics(prev => ({ ...prev, sent: prev.sent + 1 }));
        }
      };

      source.connect(processor);
      processor.connect(mute);
      mute.connect(ctx.destination);

      streamRef.current = stream;
      captureContextRef.current = ctx;
      setIsCapturing(true);
      setCaptureStatus("正在采集/推送");
    } catch (e) {
      setCaptureStatus("采集失败");
      setLastError(e);
    }
  };

  const stopCapture = useCallback(async () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (captureContextRef.current) await captureContextRef.current.close();
    setIsCapturing(false);
    setCaptureStatus("已停止");
  }, []);

  const closeNode = useCallback(async () => {
    await stopCapture();
    try { await invoke("quic_close"); } catch(e) {}
    setNodeStarted(false);
    setConnected(false);
    setQuicStatus("已关闭");
  }, [stopCapture]);

  return {
    bindAddr, setBindAddr, remoteAddr, setRemoteAddr, serverName, setServerName,
    quicStatus, captureStatus, playbackStatus, metrics, lastError,
    nodeStarted, connected, isCapturing,
    canInit: !nodeStarted,
    canConnect: nodeStarted && !connected,
    canStartTalk: nodeStarted && !isCapturing, // 只要节点启动即可讲话
    canStopTalk: isCapturing,
    initNode, connectRemote, startCapture, stopCapture, closeNode
  };
}