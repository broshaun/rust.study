import { useCallback, useRef, useState } from "react";
import { Channel, invoke } from "@tauri-apps/api/core";

export function useP2PPcmVoice(options = {}) {
  const {
    sampleRate = 48000,
    processorBufferSize = 2048,
    frameChunkSize = 512,
    initialRemotePeerId = "",
    useJitterBuffer = true,
    minBufferFrames = 4,
  } = options;

  const streamRef = useRef(null);
  const captureContextRef = useRef(null);
  const playbackContextRef = useRef(null);
  const playbackQueueRef = useRef([]);
  const nextPlayTimeRef = useRef(0);
  const drainingRef = useRef(false);

  const [remotePeerId, setRemotePeerId] = useState(initialRemotePeerId);

  const [p2pStatus, setP2pStatus] = useState("未初始化");
  const [captureStatus, setCaptureStatus] = useState("未开始");

  const [nodeStarted, setNodeStarted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const [metrics, setMetrics] = useState({ sent: 0, recv: 0, played: 0, buffered: 0 });
  const [lastError, setLastError] = useState(null);

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

      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 0x8000;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
      audioBuffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      nextPlayTimeRef.current = Math.max(nextPlayTimeRef.current, now + 0.02);
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;

      setMetrics(prev => ({
        ...prev,
        played: prev.played + 1,
        buffered: playbackQueueRef.current.length
      }));
    }

    drainingRef.current = false;
  }, [sampleRate, useJitterBuffer, minBufferFrames]);

  const initNode = async () => {
    try {
      setP2pStatus("启动中...");

      const downlink = new Channel();
      downlink.onmessage = (msg) => {
        const bytes = msg instanceof Uint8Array ? msg : new Uint8Array(msg);
        playbackQueueRef.current.push(bytes);

        setMetrics(prev => ({
          ...prev,
          recv: prev.recv + 1,
          buffered: playbackQueueRef.current.length
        }));

        playNext();
      };

      const peerId = await invoke("p2p_init", { channel: downlink });

      setNodeStarted(true);
      setP2pStatus(`节点已启动: ${peerId}`);
    } catch (e) {
      setP2pStatus("启动失败");
      setLastError(e);
    }
  };

  const connectRemote = async () => {
    try {
      setP2pStatus("连接中...");
      await invoke("p2p_connect", { addr: remotePeerId });
      setConnected(true);
      setP2pStatus("已连接");
    } catch (e) {
      setP2pStatus("连接失败");
      setLastError(e);
    }
  };

  const startCapture = async () => {
    try {
      setCaptureStatus("开启麦克风...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const ctx = new AudioContext({ sampleRate });
      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(processorBufferSize, 1, 1);

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

          invoke("p2p_send", {
            peerId: remotePeerId,
            data: Array.from(new Uint8Array(chunk.buffer))
          });

          setMetrics(prev => ({
            ...prev,
            sent: prev.sent + 1
          }));
        }
      };

      source.connect(processor);
      processor.connect(mute);
      mute.connect(ctx.destination);

      streamRef.current = stream;
      captureContextRef.current = ctx;

      setIsCapturing(true);
      setCaptureStatus("采集中");
    } catch (e) {
      setCaptureStatus("失败");
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

    try {
      await invoke("p2p_close", { peerId: remotePeerId });
    } catch (e) {}

    setNodeStarted(false);
    setConnected(false);
    setP2pStatus("已关闭");
  }, [stopCapture, remotePeerId]);

  return {
    remotePeerId,
    setRemotePeerId,

    p2pStatus,
    captureStatus,
    metrics,
    lastError,

    nodeStarted,
    connected,
    isCapturing,

    canInit: !nodeStarted,
    canConnect: nodeStarted && !connected,
    canStartTalk: nodeStarted && connected && !isCapturing,
    canStopTalk: isCapturing,

    initNode,
    connectRemote,
    startCapture,
    stopCapture,
    closeNode
  };
}