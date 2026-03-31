import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

function extractPeerIdFromMultiaddr(addr) {
  if (!addr) return "";
  const parts = String(addr).split("/").filter(Boolean);
  const p2pIndex = parts.findIndex((p) => p === "p2p");
  if (p2pIndex >= 0 && parts[p2pIndex + 1]) {
    return parts[p2pIndex + 1];
  }
  return "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useP2PPcmVoice(options = {}) {
  const {
    sampleRate = 48000,
    processorBufferSize = 1024,
    frameSamples = 960,
    initialRemoteAddr = "",
    useJitterBuffer = true,
    minBufferFrames = 2,
    maxBufferFrames = 6,
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

  const [peerId, setPeerId] = useState("");
  const [listenAddr, setListenAddr] = useState("");
  const [quicAddr, setQuicAddr] = useState("");
  const [tcpAddr, setTcpAddr] = useState("");

  const [remoteAddr, setRemoteAddr] = useState(initialRemoteAddr);
  const [remoteQuicAddr, setRemoteQuicAddr] = useState("");
  const [remoteTcpAddr, setRemoteTcpAddr] = useState("");

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
  });
  const [lastError, setLastError] = useState(null);

  const remotePeerId = useMemo(() => {
    return (
      extractPeerIdFromMultiaddr(remoteQuicAddr) ||
      extractPeerIdFromMultiaddr(remoteTcpAddr) ||
      extractPeerIdFromMultiaddr(remoteAddr)
    );
  }, [remoteAddr, remoteQuicAddr, remoteTcpAddr]);

  const appendLog = useCallback((text) => {
    setLogs((prev) => {
      const next = [...prev, `[${new Date().toLocaleTimeString()}] ${text}`];
      return next.slice(-200);
    });
  }, []);

  const concatInt16 = (a, b) => {
    const out = new Int16Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
  };

  const playNext = useCallback(async () => {
    if (drainingRef.current) return;
    if (playbackQueueRef.current.length < (useJitterBuffer ? minBufferFrames : 1)) return;

    drainingRef.current = true;

    try {
      if (!playbackContextRef.current) {
        playbackContextRef.current = new AudioContext({ sampleRate });
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
    if (!remotePeerId) return;

    sendingRef.current = true;

    try {
      while (sendQueueRef.current.length > 0) {
        const packet = sendQueueRef.current.shift();

        await invoke("p2p_send", {
          peerId: remotePeerId,
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
  }, [appendLog, remotePeerId]);

  useEffect(() => {
    let unlistenLog;
    let unlistenData;
    let unlistenPing;

    const bindEvents = async () => {
      unlistenLog = await listen("p2p-log", (event) => {
        const msg = String(event.payload ?? "");
        appendLog(msg);

        if (msg.includes("listening:")) {
          setP2pStatus("节点已启动");
          setNodeStarted(true);
        }

        if (msg.includes("connected:")) {
          setConnected(true);
          setP2pStatus("已连接");
        }
      });

      unlistenPing = await listen("p2p-ping", (event) => {
        appendLog(`ping: ${String(event.payload ?? "")}`);
      });

      unlistenData = await listen("p2p-data", (event) => {
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

        if (playbackQueueRef.current.length > maxBufferFrames) {
          playbackQueueRef.current.splice(0, playbackQueueRef.current.length - maxBufferFrames);
          nextPlayTimeRef.current = 0;
        }

        setMetrics((prev) => ({
          ...prev,
          recv: prev.recv + 1,
          buffered: playbackQueueRef.current.length,
        }));

        playNext();
      });
    };

    bindEvents();

    return () => {
      if (unlistenLog) unlistenLog();
      if (unlistenPing) unlistenPing();
      if (unlistenData) unlistenData();
    };
  }, [appendLog, maxBufferFrames, playNext]);

  const initNode = async () => {
    try {
      setP2pStatus("启动中...");
      setLastError(null);

      const res = await invoke("p2p_init");

      setPeerId(res.peer_id || "");
      setListenAddr(res.preferred_addr || "");
      setQuicAddr(res.quic_addr || "");
      setTcpAddr(res.tcp_addr || "");
      setNodeStarted(true);
      setP2pStatus((res.preferred_addr || res.quic_addr || res.tcp_addr) ? "节点已启动" : "已启动，等待地址");

      appendLog(`peerId: ${res.peer_id || ""}`);
      appendLog(`preferredAddr: ${res.preferred_addr || ""}`);
      appendLog(`quicAddr: ${res.quic_addr || ""}`);
      appendLog(`tcpAddr: ${res.tcp_addr || ""}`);
    } catch (e) {
      setP2pStatus("启动失败");
      setLastError(e);
      appendLog(`启动失败: ${e?.message || String(e)}`);
    }
  };

  const pingRemote = useCallback(async () => {
    if (!remotePeerId) {
      throw new Error("远端 PeerId 解析失败");
    }

    const res = await invoke("p2p_ping", { peerId: remotePeerId });
    appendLog(`manual ping result: ${res}`);
    return res;
  }, [appendLog, remotePeerId]);

  const connectRemote = async () => {
    try {
      let qAddr = remoteQuicAddr;
      let tAddr = remoteTcpAddr;

      if (!qAddr && !tAddr && remoteAddr) {
        if (remoteAddr.includes("/quic-v1")) {
          qAddr = remoteAddr;
        } else if (remoteAddr.includes("/tcp/")) {
          tAddr = remoteAddr;
        }
      }

      if (!qAddr && !tAddr) {
        throw new Error("请先填写远端连接地址");
      }

      if (!remotePeerId) {
        throw new Error("远端 PeerId 解析失败");
      }

      setP2pStatus("连接中...");
      setConnected(false);
      setLastError(null);

      await invoke("p2p_connect", {
        quicAddr: qAddr || null,
        tcpAddr: tAddr || null,
      });

      appendLog(`发起连接: quic=${qAddr || "-"} tcp=${tAddr || "-"}`);

      let ok = false;

      for (let i = 0; i < 20; i++) {
        try {
          const pong = await invoke("p2p_ping", { peerId: remotePeerId });
          appendLog(`ping attempt ${i + 1}: ${pong}`);

          if (String(pong).toLowerCase().includes("pong")) {
            ok = true;
            break;
          }
        } catch {
          appendLog(`ping attempt ${i + 1} failed`);
        }

        await sleep(300);
      }

      if (ok) {
        setConnected(true);
        setP2pStatus("已连接");
      } else {
        setConnected(false);
        setP2pStatus("连接失败");
        throw new Error("连接已发起，但 ping 未成功");
      }
    } catch (e) {
      setConnected(false);
      setP2pStatus("连接失败");
      setLastError(e);
      appendLog(`连接失败: ${e?.message || String(e)}`);
    }
  };

  const startCapture = async () => {
    try {
      if (!nodeStarted) throw new Error("请先启动节点");
      if (!connected) throw new Error("请先建立连接");
      if (!remotePeerId) throw new Error("远端 PeerId 解析失败");

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
      appendLog(`开始讲话，发送到: ${remotePeerId}`);
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
      await invoke("p2p_close", { peerId: remotePeerId || peerId });

      setConnected(false);
      setNodeStarted(false);
      setPeerId("");
      setListenAddr("");
      setQuicAddr("");
      setTcpAddr("");
      setP2pStatus("已关闭");
      playbackQueueRef.current = [];
      nextPlayTimeRef.current = 0;
      appendLog("节点已关闭");
    } catch (e) {
      setLastError(e);
      appendLog(`关闭失败: ${e?.message || String(e)}`);
    }
  }, [appendLog, peerId, remotePeerId, stopCapture]);

  const copyListenAddr = useCallback(async () => {
    if (!listenAddr) {
      throw new Error("请先启动节点并等待监听地址生成");
    }

    await navigator.clipboard.writeText(listenAddr);
    appendLog("已复制连接地址");
  }, [appendLog, listenAddr]);

  return {
    peerId,
    listenAddr,
    quicAddr,
    tcpAddr,

    remoteAddr,
    setRemoteAddr,
    remoteQuicAddr,
    setRemoteQuicAddr,
    remoteTcpAddr,
    setRemoteTcpAddr,
    remotePeerId,

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
    canConnect: nodeStarted && (!!remoteAddr || !!remoteQuicAddr || !!remoteTcpAddr),
    canStartTalk: nodeStarted && connected && !!remotePeerId && !isCapturing,
    canStopTalk: isCapturing,
    canCopyAddr: !!listenAddr,
    canPing: nodeStarted && !!remotePeerId,

    initNode,
    connectRemote,
    pingRemote,
    startCapture,
    stopCapture,
    closeNode,
    copyListenAddr,
  };
}