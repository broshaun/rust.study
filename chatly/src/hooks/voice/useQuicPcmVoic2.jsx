import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Channel, invoke } from "@tauri-apps/api/core";

// --- 音频转换工具函数 ---

function float32ToInt16(float32Array) {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i += 1) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16Array;
}

function int16ToUint8(int16Array) {
  return new Uint8Array(int16Array.buffer.slice(0));
}

function uint8ToInt16(uint8Array) {
  const buffer = uint8Array.buffer.slice(
    uint8Array.byteOffset,
    uint8Array.byteOffset + uint8Array.byteLength
  );
  return new Int16Array(buffer);
}

function int16ToFloat32(int16Array) {
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i += 1) {
    float32Array[i] = int16Array[i] / 0x8000;
  }
  return float32Array;
}

// --- Hook 主体 ---

export function useQuicPcmVoice(options = {}) {
  const {
    sampleRate = 48000,
    processorBufferSize = 2048, // 增大 Buffer 减少低端设备的卡顿
    frameChunkSize = 512,
    initialBindAddr = "0.0.0.0:6000",
    initialRemoteAddr = "127.0.0.1:6001",
    initialServerName = "localhost",

    // 播放策略（抖动缓冲区控制）
    useJitterBuffer = true,
    minBufferFrames = 4,
    maxBufferFrames = 24,
    startupDelaySec = 0.06,
  } = options;

  // 引用管理
  const streamRef = useRef(null);
  const captureContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const processorNodeRef = useRef(null);
  const muteGainRef = useRef(null);

  const playbackContextRef = useRef(null);
  const nextPlayTimeRef = useRef(0);
  const playbackQueueRef = useRef([]);
  const drainingRef = useRef(false);
  const playbackStartedRef = useRef(false);

  const sendQueueRef = useRef([]);
  const sendingRef = useRef(false);

  // 状态管理
  const [bindAddr, setBindAddr] = useState(initialBindAddr);
  const [remoteAddr, setRemoteAddr] = useState(initialRemoteAddr);
  const [serverName, setServerName] = useState(initialServerName);

  const [quicStatus, setQuicStatus] = useState("未初始化");
  const [captureStatus, setCaptureStatus] = useState("未开始");
  const [playbackStatus, setPlaybackStatus] = useState("未播放");
  const [lastError, setLastError] = useState(null);
  const [playbackError, setPlaybackError] = useState(null);

  const [nodeStarted, setNodeStarted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const [sentFrameCount, setSentFrameCount] = useState(0);
  const [recvFrameCount, setRecvFrameCount] = useState(0);
  const [playedFrameCount, setPlayedFrameCount] = useState(0);
  const [bufferedFrameCount, setBufferedFrameCount] = useState(0);

  // 初始化播放上下文
  const ensurePlaybackContext = useCallback(async () => {
    if (!playbackContextRef.current) {
      playbackContextRef.current = new AudioContext({ sampleRate });
    }
    if (playbackContextRef.current.state === "suspended") {
      await playbackContextRef.current.resume();
    }
    return playbackContextRef.current;
  }, [sampleRate]);

  // 核心播放逻辑：Jitter Buffer 处理
  const drainPlaybackQueue = useCallback(async () => {
    if (!useJitterBuffer || drainingRef.current) return;
    drainingRef.current = true;

    try {
      await ensurePlaybackContext();
      const context = playbackContextRef.current;

      if (!playbackStartedRef.current) {
        if (playbackQueueRef.current.length < minBufferFrames) {
          setBufferedFrameCount(playbackQueueRef.current.length);
          setPlaybackStatus(`缓冲中 (${playbackQueueRef.current.length}/${minBufferFrames})`);
          return;
        }
        playbackStartedRef.current = true;
        nextPlayTimeRef.current = context.currentTime + startupDelaySec;
      }

      while (playbackQueueRef.current.length > 0) {
        const bytes = playbackQueueRef.current.shift();
        const int16 = uint8ToInt16(bytes);
        const float32 = int16ToFloat32(int16);

        const audioBuffer = context.createBuffer(1, float32.length, sampleRate);
        audioBuffer.copyToChannel(float32, 0);

        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);

        const now = context.currentTime;
        // 防漂移处理：如果调度时间落后太多，强制重置
        if (nextPlayTimeRef.current < now - 0.1) {
          nextPlayTimeRef.current = now + 0.02;
        }

        const startAt = Math.max(nextPlayTimeRef.current, now + 0.01);
        source.start(startAt);

        nextPlayTimeRef.current = startAt + audioBuffer.duration;
        setPlayedFrameCount((prev) => prev + 1);
      }

      setBufferedFrameCount(playbackQueueRef.current.length);
      setPlaybackStatus(playbackQueueRef.current.length > 0 ? "播放中" : "等待音频");
    } catch (error) {
      setPlaybackError(error);
    } finally {
      drainingRef.current = false;
    }
  }, [ensurePlaybackContext, minBufferFrames, sampleRate, startupDelaySec, useJitterBuffer]);

  // 接收到远程音频数据
  const playIncomingChunk = useCallback(async (payload) => {
    try {
      const bytes = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
      
      // 限制最大延迟，超过则丢弃旧帧
      if (playbackQueueRef.current.length >= maxBufferFrames) {
        playbackQueueRef.current.shift();
      }

      playbackQueueRef.current.push(bytes);
      setBufferedFrameCount(playbackQueueRef.current.length);
      await drainPlaybackQueue();
    } catch (error) {
      setPlaybackStatus("播放异常");
    }
  }, [drainPlaybackQueue, maxBufferFrames]);

  // 发送数据到 Rust 后端
  const flushSendQueue = useCallback(async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    try {
      while (sendQueueRef.current.length > 0) {
        const chunk = sendQueueRef.current.shift();
        await invoke("quic_send", { data: Array.from(chunk) });
      }
    } catch (error) {
      setLastError(error);
    } finally {
      sendingRef.current = false;
    }
  }, []);

  const sendChunk = useCallback(async (payload) => {
    sendQueueRef.current.push(payload);
    await flushSendQueue();
  }, [flushSendQueue]);

  // --- 业务控制函数 ---

  const initNode = useCallback(async () => {
    try {
      setQuicStatus(`正在启动节点...`);
      const downlink = new Channel();
      downlink.onmessage = (message) => {
        setRecvFrameCount((prev) => prev + 1);
        playIncomingChunk(message);
      };

      await invoke("quic_init", { bindAddr, channel: downlink });
      setNodeStarted(true);
      setQuicStatus(`节点就绪: ${bindAddr}`);
    } catch (error) {
      setQuicStatus("启动失败");
      setLastError(error);
    }
  }, [bindAddr, playIncomingChunk]);

  const connectRemote = useCallback(async () => {
    try {
      setQuicStatus(`连接中...`);
      await invoke("quic_connect", { remote: remoteAddr, serverName });
      setConnected(true);
      setQuicStatus(`通话已建立: ${remoteAddr}`);
    } catch (error) {
      setQuicStatus("连接失败");
      setLastError(error);
    }
  }, [remoteAddr, serverName]);

  // 【核心修改点】开启降噪、去回声、自动增益
  const startCapture = useCallback(async () => {
    try {
      setCaptureStatus("正在初始化降噪模组...");

      // 明确请求处理后的音频流
      const constraints = {
        audio: {
          echoCancellation: true,      // 去回声 (AEC)
          noiseSuppression: true,      // 降噪 (ANS)
          autoGainControl: true,       // 自动增益控制 (AGC)
          channelCount: 1,             // 语音通常使用单声道以节省带宽
          sampleRate: sampleRate       // 匹配目标采样率
        },
        video: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const audioContext = new AudioContext({ sampleRate });
      
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const processorNode = audioContext.createScriptProcessor(processorBufferSize, 1, 1);
      
      // 必须接一个 GainNode 设为 0，防止本地听到自己的声音产生啸叫
      const muteGain = audioContext.createGain();
      muteGain.gain.value = 0;

      processorNode.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const float32Frame = new Float32Array(input);
        const int16Frame = float32ToInt16(float32Frame);

        for (let i = 0; i < int16Frame.length; i += frameChunkSize) {
          const subFrame = int16Frame.slice(i, i + frameChunkSize);
          sendChunk(int16ToUint8(subFrame));
          setSentFrameCount((prev) => prev + 1);
        }
      };

      sourceNode.connect(processorNode);
      processorNode.connect(muteGain);
      muteGain.connect(audioContext.destination);

      streamRef.current = stream;
      captureContextRef.current = audioContext;
      sourceNodeRef.current = sourceNode;
      processorNodeRef.current = processorNode;
      muteGainRef.current = muteGain;

      setIsCapturing(true);
      setCaptureStatus("高清语音传输中");
    } catch (error) {
      setCaptureStatus(`麦克风启动失败`);
      setLastError(error);
    }
  }, [frameChunkSize, processorBufferSize, sampleRate, sendChunk]);

  const stopCapture = useCallback(async () => {
    if (processorNodeRef.current) {
      processorNodeRef.current.onaudioprocess = null;
      processorNodeRef.current.disconnect();
    }
    if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
    if (muteGainRef.current) muteGainRef.current.disconnect();
    if (captureContextRef.current) await captureContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());

    setIsCapturing(false);
    setCaptureStatus("已停止");
  }, []);

  const closeNode = useCallback(async () => {
    await stopCapture();
    try { await invoke("quic_close"); } catch(e){}
    if (playbackContextRef.current) await playbackContextRef.current.close();
    setNodeStarted(false);
    setConnected(false);
    setQuicStatus("连接已断开");
  }, [stopCapture]);

  // 状态导出
  const canInit = useMemo(() => !nodeStarted, [nodeStarted]);
  const canConnect = useMemo(() => nodeStarted && !connected, [nodeStarted, connected]);
  const canStartTalk = useMemo(() => nodeStarted && connected && !isCapturing, [nodeStarted, connected, isCapturing]);

  useEffect(() => {
    return () => { closeNode(); };
  }, [closeNode]);

  return {
    bindAddr, setBindAddr,
    remoteAddr, setRemoteAddr,
    serverName, setServerName,
    quicStatus, captureStatus, playbackStatus,
    lastError, nodeStarted, connected, isCapturing,
    sentFrameCount, recvFrameCount, playedFrameCount, bufferedFrameCount,
    canInit, canConnect, canStartTalk,
    initNode, connectRemote, startCapture, stopCapture, closeNode
  };
}