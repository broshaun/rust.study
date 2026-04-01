import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useP2PPcmVoice(options = {}) {
  const {
    sampleRate = 48000,
    processorBufferSize = 2048,
    frameSamples = 960, // 20ms @ 48kHz
    initialRemoteAddr = "",
    useJitterBuffer = true,
    minBufferFrames = 4,
    maxBufferFrames = 10,
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

  const [localAddrJson, setLocalAddrJson] = useState("");
  const [remoteAddrJson, setRemoteAddrJson] = useState(initialRemoteAddr);

  const [p2pStatus, setP2pStatus] = useState("未初始化");
  const [captureStatus, setCaptureStatus] = useState("未开始");
  const [playbackStatus, setPlaybackStatus] = useState("等待音频");

  const [nodeStarted, setNodeStarted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    sent: 0,
    recv: 0,
    played: 0,
    buffered: 0,
    lastSeq: 0,
    lastTimestampMs: 0,
  });
  const [lastError, setLastError] = useState(null);

  const appendLog = useCallback((text) => {
    setLogs((prev) => {
      const next = [...prev, `[${new Date().toLocaleTimeString()}] ${text}`];
      return next.slice(-300);
    });
  }, []);

  const concatInt16 = (a, b) => {
    const out = new Int16Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
  };

  const resetPlayback = useCallback(() => {
    playbackQueueRef.current = [];
    nextPlayTimeRef.current = 0;
    setPlaybackStatus("等待音频");
    setMetrics((prev) => ({
      ...prev,
      buffered: 0,
    }));
  }, []);

  const decodePayloadToFloat32 = useCallback((bytes) => {
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
    return float32;
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
        const float32 = decodePayloadToFloat32(bytes);

        if (float32.length === 0) {
          continue;
        }

        const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
        audioBuffer.copyToChannel(float32, 0);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);

        const now = ctx.currentTime;

        // 更稳的调度：减少频繁抢播导致的毛刺
        if (
          nextPlayTimeRef.current === 0 ||
          nextPlayTimeRef.current < now - 0.02 ||
          nextPlayTimeRef.current - now > 0.2
        ) {
          nextPlayTimeRef.current = now + 0.03;
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
  }, [appendLog, decodePayloadToFloat32, minBufferFrames, sampleRate, useJitterBuffer]);

  const flushSendQueue = useCallback(async () => {
    if (sendingRef.current) return;
    if (!connected) return;

    sendingRef.current = true;

    try {
      while (sendQueueRef.current.length > 0) {
        const packet = sendQueueRef.current.shift();

        await invoke("p2p_send", {
          data: packet,
        });

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
  }, [appendLog, connected]);

  useEffect(() => {
    let offLog;
    let offData;
    let offPacket;
    let offReady;
    let offConnected;
    let offClosed;

    const bindEvents = async () => {
      offLog = await listen("p2p-log", (event) => {
        const msg = String(event.payload ?? "");
        appendLog(msg);
      });

      offReady = await listen("p2p-ready", () => {
        setNodeStarted(true);
        setP2pStatus("节点已启动");
      });

      offConnected = await listen("p2p-connected", () => {
        setConnected(true);
        setP2pStatus("已连接");
        appendLog("连接已建立");
      });

      offClosed = await listen("p2p-closed", () => {
        setConnected(false);
        setNodeStarted(false);
        setIsCapturing(false);
        setP2pStatus("已关闭");
        resetPlayback();
        appendLog("连接已关闭");
      });

      offData = await listen("p2p-data", (event) => {
        const payload = event.payload;
        let bytes;

        if (payload instanceof Uint8Array) {
          bytes = payload;
        } else if (Array.isArray(payload)) {
          bytes = new Uint8Array(payload);
        } else {
          bytes = new Uint8Array(payload || []);
        }

        playbackQueueRef.current.push(bytes);

        // 队列太长时，丢老包，保持实时性
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
      });

      offPacket = await listen("p2p-packet", (event) => {
        const pkt = event.payload || {};
        setMetrics((prev) => ({
          ...prev,
          lastSeq: Number(pkt.seq || 0),
          lastTimestampMs: Number(pkt.timestamp_ms || 0),
        }));
      });
    };

    bindEvents();

    return () => {
      if (offLog) offLog();
      if (offData) offData();
      if (offPacket) offPacket();
      if (offReady) offReady();
      if (offConnected) offConnected();
      if (offClosed) offClosed();
    };
  }, [appendLog, maxBufferFrames, playNext, resetPlayback]);

  const initNode = async () => {
    try {
      setP2pStatus("启动中...");
      setLastError(null);

      const res = await invoke("p2p_init");

      const addr = res?.local_addr_json || "";
      setLocalAddrJson(addr);
      setNodeStarted(true);
      setP2pStatus(addr ? "节点已启动" : "已启动，等待地址");

      appendLog("本地节点初始化完成");
      appendLog(`localAddrJson: ${addr}`);
    } catch (e) {
      setP2pStatus("启动失败");
      setLastError(e);
      appendLog(`启动失败: ${e?.message || String(e)}`);
    }
  };

  const refreshLocalAddr = useCallback(async () => {
    try {
      const addr = await invoke("p2p_get_local_addr");
      setLocalAddrJson(addr || "");
      appendLog("已刷新本地地址");
      return addr;
    } catch (e) {
      setLastError(e);
      appendLog(`获取本地地址失败: ${e?.message || String(e)}`);
      throw e;
    }
  }, [appendLog]);

  const connectRemote = async () => {
    try {
      const addr = String(remoteAddrJson || "").trim();

      if (!addr) {
        throw new Error("请先填写远端地址 JSON");
      }

      setP2pStatus("连接中...");
      setConnected(false);
      setLastError(null);

      await invoke("p2p_connect", {
        remoteAddrJson: addr,
      });

      appendLog("已发起连接请求");
      setP2pStatus("连接已发起，等待建立");

      // 等事件，不再 ping
      for (let i = 0; i < 20; i++) {
        await sleep(150);
      }
    } catch (e) {
      setConnected(false);
      setP2pStatus("连接失败");
      setLastError(e);
      appendLog(`连接失败: ${e?.message || String(e)}`);
    }
  };

  const checkAudioInput = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter((d) => d.kind === "audioinput");

      appendLog(`音频输入设备数量: ${audioInputs.length}`);
      audioInputs.forEach((d, i) => {
        appendLog(`mic[${i}]: ${d.label || "(无标签，可能还未授权)"}`);
      });

      return audioInputs;
    } catch (e) {
      setLastError(e);
      appendLog(`检查音频设备失败: ${e?.message || String(e)}`);
      throw e;
    }
  }, [appendLog]);

  const startCapture = async () => {
    try {
      if (!nodeStarted) throw new Error("请先启动节点");
      if (!connected) throw new Error("请先建立连接");

      setCaptureStatus("检查麦克风...");
      setLastError(null);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter((d) => d.kind === "audioinput");

      appendLog(`检测到音频输入设备数量: ${audioInputs.length}`);

      if (audioInputs.length === 0) {
        throw new Error("未检测到任何麦克风设备，请检查系统麦克风和权限");
      }

      let stream;
      try {
        // 先用相对宽松的约束，优先拿到稳定输入
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
          video: false,
        });
      } catch (e1) {
        appendLog(`宽松采集失败，尝试最小约束: ${e1?.message || String(e1)}`);
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      }

      const ctx = new AudioContext({
        sampleRate,
        latencyHint: "interactive",
      });

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

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

        // 20ms 组帧
        while (merged.length >= frameSamples) {
          const frame20ms = merged.slice(0, frameSamples);
          merged = merged.slice(frameSamples);

          // 拆成两个 10ms 小包发送，避免 datagram 超限
          const half = frame20ms.length / 2;
          const frameA = frame20ms.slice(0, half);
          const frameB = frame20ms.slice(half);

          sendQueueRef.current.push(Array.from(new Uint8Array(frameA.buffer)));
          sendQueueRef.current.push(Array.from(new Uint8Array(frameB.buffer)));
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
      appendLog("麦克风已开启");
      appendLog("已启用 AEC/降噪/自动增益（如系统支持）");
      appendLog("20ms 采集，10ms 分包发送");
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
      await invoke("p2p_close");

      setConnected(false);
      setNodeStarted(false);
      setLocalAddrJson("");
      setP2pStatus("已关闭");
      resetPlayback();
      appendLog("节点已关闭");
    } catch (e) {
      setLastError(e);
      appendLog(`关闭失败: ${e?.message || String(e)}`);
    }
  }, [appendLog, resetPlayback, stopCapture]);

  const copyLocalAddr = useCallback(async () => {
    if (!localAddrJson) {
      throw new Error("请先启动节点并等待地址生成");
    }

    await navigator.clipboard.writeText(localAddrJson);
    appendLog("已复制本地地址 JSON");
  }, [appendLog, localAddrJson]);

  return {
    localAddrJson,
    remoteAddrJson,
    setRemoteAddrJson,

    p2pStatus,
    captureStatus,
    playbackStatus,
    logs,
    metrics,
    lastError,

    nodeStarted,
    connected,
    isCapturing,

    canInit: !nodeStarted,
    canConnect: nodeStarted && !!remoteAddrJson.trim(),
    canStartTalk: nodeStarted && connected && !isCapturing,
    canStopTalk: isCapturing,
    canCopyAddr: !!localAddrJson,

    initNode,
    refreshLocalAddr,
    checkAudioInput,
    connectRemote,
    startCapture,
    stopCapture,
    closeNode,
    copyLocalAddr,
  };
}