import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Channel, invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function concatInt16(a, b) {
  const out = new Int16Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function calcRmsInt16(frame) {
  if (!frame || frame.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < frame.length; i++) {
    const v = frame[i] / 32768;
    sum += v * v;
  }
  return Math.sqrt(sum / frame.length);
}

function seqLess(a, b) {
  return a < b;
}

export function useP2PPcmVoice(options = {}) {
  const {
    sampleRate = 48000,
    processorBufferSize = 512,
    frameSamples = 480,
    useJitterBuffer = true,
    minBufferFrames = 3,
    maxBufferFrames = 10,
    reorderWindow = 3,
    lateDropMs = 250,
    initialRemoteAddr = "",

    // VAD 参数
    enableVad = true,
    vadRmsThreshold = 0.012,      // 可调：0.008~0.02
    vadHangoverFrames = 6,        // 静音开始后再多发几帧，避免吞字
    vadAttackFrames = 1,          // 一有声音，几乎立即恢复
  } = options;

  const streamRef = useRef(null);
  const captureContextRef = useRef(null);
  const playbackContextRef = useRef(null);

  const nextPlayTimeRef = useRef(0);
  const drainingRef = useRef(false);

  const captureCarryRef = useRef(new Int16Array(0));
  const sendQueueRef = useRef([]);
  const sendingRef = useRef(false);
  const downlinkChannelRef = useRef(null);

  const packetBufferRef = useRef(new Map());
  const expectedSeqRef = useRef(null);
  const latestSeqRef = useRef(null);
  const playbackQueueRef = useRef([]);

  const transitSamplesRef = useRef([]);
  const lastPacketMetaRef = useRef({ seq: 0, timestampMs: 0 });

  // VAD 状态
  const vadSpeechStreakRef = useRef(0);
  const vadSilenceStreakRef = useRef(0);
  const vadOpenRef = useRef(true);

  const [localAddrJson, setLocalAddrJson] = useState("");
  const [remoteAddrJson, setRemoteAddrJson] = useState(initialRemoteAddr);

  const [p2pStatus, setP2pStatus] = useState("未初始化");
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
    lastSeq: 0,
    lastTimestampMs: 0,
    lost: 0,
    outOfOrder: 0,
    lateDropped: 0,
    avgTransitMs: 0,
    vadDropped: 0,
  });

  const appendLog = useCallback((text) => {
    setLogs((prev) => {
      const next = [...prev, `[${new Date().toLocaleTimeString()}] ${text}`];
      return next.slice(-250);
    });
  }, []);

  const resetJitterState = useCallback(() => {
    packetBufferRef.current.clear();
    playbackQueueRef.current = [];
    expectedSeqRef.current = null;
    latestSeqRef.current = null;
    nextPlayTimeRef.current = 0;
    transitSamplesRef.current = [];
    lastPacketMetaRef.current = { seq: 0, timestampMs: 0 };

    vadSpeechStreakRef.current = 0;
    vadSilenceStreakRef.current = 0;
    vadOpenRef.current = true;

    setMetrics((prev) => ({
      ...prev,
      buffered: 0,
      lastSeq: 0,
      lastTimestampMs: 0,
      lost: 0,
      outOfOrder: 0,
      lateDropped: 0,
      avgTransitMs: 0,
      vadDropped: 0,
    }));
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

        const fadeSamples = Math.min(16, Math.floor(float32.length / 8));
        for (let i = 0; i < fadeSamples; i++) {
          const g = i / fadeSamples;
          float32[i] *= g;
          float32[float32.length - 1 - i] *= g;
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
          nextPlayTimeRef.current - now > 0.15
        ) {
          nextPlayTimeRef.current = now + 0.02;
        }

        source.start(nextPlayTimeRef.current);
        nextPlayTimeRef.current += audioBuffer.duration;

        setMetrics((prev) => ({
          ...prev,
          played: prev.played + 1,
          buffered: playbackQueueRef.current.length + packetBufferRef.current.size,
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

  const flushPlayablePackets = useCallback(() => {
    const buffer = packetBufferRef.current;
    let expected = expectedSeqRef.current;

    if (expected == null) return;

    let moved = 0;
    let droppedMissing = 0;

    while (true) {
      if (buffer.has(expected)) {
        const pkt = buffer.get(expected);
        buffer.delete(expected);
        playbackQueueRef.current.push(pkt.payload);
        expected += 1;
        moved += 1;
        continue;
      }

      if (buffer.size >= reorderWindow) {
        const keys = [...buffer.keys()].sort((a, b) => a - b);
        if (keys.length > 0 && seqLess(expected, keys[0])) {
          droppedMissing += keys[0] - expected;
          expected = keys[0];
          continue;
        }
      }

      break;
    }

    expectedSeqRef.current = expected;

    if (droppedMissing > 0) {
      setMetrics((prev) => ({
        ...prev,
        lost: prev.lost + droppedMissing,
      }));
    }

    if (playbackQueueRef.current.length > maxBufferFrames) {
      const dropCount = playbackQueueRef.current.length - maxBufferFrames;
      playbackQueueRef.current.splice(0, dropCount);
      nextPlayTimeRef.current = 0;
    }

    setMetrics((prev) => ({
      ...prev,
      buffered: playbackQueueRef.current.length + buffer.size,
    }));

    if (moved > 0) {
      playNext();
    }
  }, [maxBufferFrames, playNext, reorderWindow]);

  const handleIncomingPayload = useCallback(
    (bytes) => {
      const meta = lastPacketMetaRef.current;
      const seq = Number(meta.seq || 0);
      const timestampMs = Number(meta.timestampMs || 0);
      const now = Date.now();

      if (!seq || !timestampMs) {
        playbackQueueRef.current.push(bytes);
        setMetrics((prev) => ({
          ...prev,
          recv: prev.recv + 1,
          buffered: playbackQueueRef.current.length + packetBufferRef.current.size,
        }));
        playNext();
        return;
      }

      const transitMs = Math.max(0, now - timestampMs);
      transitSamplesRef.current.push(transitMs);
      if (transitSamplesRef.current.length > 30) {
        transitSamplesRef.current.shift();
      }
      const avgTransitMs =
        transitSamplesRef.current.reduce((a, b) => a + b, 0) /
        transitSamplesRef.current.length;

      if (transitMs > lateDropMs) {
        setMetrics((prev) => ({
          ...prev,
          recv: prev.recv + 1,
          lateDropped: prev.lateDropped + 1,
          avgTransitMs: Math.round(avgTransitMs),
          lastSeq: seq,
          lastTimestampMs: timestampMs,
          buffered: playbackQueueRef.current.length + packetBufferRef.current.size,
        }));
        return;
      }

      if (expectedSeqRef.current == null) {
        expectedSeqRef.current = seq;
      }

      const latest = latestSeqRef.current;
      let outOfOrderInc = 0;
      if (latest != null && seq < latest) {
        outOfOrderInc = 1;
      }
      latestSeqRef.current = latest == null ? seq : Math.max(latest, seq);

      const expected = expectedSeqRef.current;
      if (seq < expected) {
        setMetrics((prev) => ({
          ...prev,
          recv: prev.recv + 1,
          lateDropped: prev.lateDropped + 1,
          outOfOrder: prev.outOfOrder + outOfOrderInc,
          avgTransitMs: Math.round(avgTransitMs),
          lastSeq: seq,
          lastTimestampMs: timestampMs,
          buffered: playbackQueueRef.current.length + packetBufferRef.current.size,
        }));
        return;
      }

      if (!packetBufferRef.current.has(seq)) {
        packetBufferRef.current.set(seq, {
          payload: bytes,
          timestampMs,
          arrivedAt: now,
        });
      }

      setMetrics((prev) => ({
        ...prev,
        recv: prev.recv + 1,
        outOfOrder: prev.outOfOrder + outOfOrderInc,
        avgTransitMs: Math.round(avgTransitMs),
        lastSeq: seq,
        lastTimestampMs: timestampMs,
        buffered: playbackQueueRef.current.length + packetBufferRef.current.size,
      }));

      flushPlayablePackets();
    },
    [flushPlayablePackets, lateDropMs, playNext]
  );

  const flushSendQueue = useCallback(async () => {
    if (sendingRef.current) return;

    sendingRef.current = true;

    try {
      while (sendQueueRef.current.length > 0) {
        const packet = sendQueueRef.current.shift();
        await invoke("p2p_send", { data: packet });

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

      handleIncomingPayload(bytes);
    };

    downlinkChannelRef.current = channel;
    return channel;
  }, [handleIncomingPayload]);

  useEffect(() => {
    let offLog;
    let offReady;
    let offConnected;
    let offClosed;
    let offPacket;

    const bindEvents = async () => {
      offLog = await listen("p2p-log", (event) => {
        const msg = String(event.payload ?? "");
        appendLog(msg);
      });

      offReady = await listen("p2p-ready", () => {
        setInitialized(true);
        setP2pStatus("已初始化");
      });

      offConnected = await listen("p2p-connected", () => {
        setConnected(true);
        setP2pStatus("已连接");
        appendLog("连接成功");
      });

      offClosed = await listen("p2p-closed", () => {
        setConnected(false);
        setInitialized(false);
        setIsCapturing(false);
        setP2pStatus("已关闭");
        resetJitterState();
        appendLog("连接已关闭");
      });

      offPacket = await listen("p2p-packet", (event) => {
        const pkt = event.payload || {};
        lastPacketMetaRef.current = {
          seq: Number(pkt.seq || 0),
          timestampMs: Number(pkt.timestamp_ms || 0),
        };

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
      if (offReady) offReady();
      if (offConnected) offConnected();
      if (offClosed) offClosed();
      if (offPacket) offPacket();
    };
  }, [appendLog, resetJitterState]);

  const initNode = async () => {
    try {
      setP2pStatus("初始化中...");
      setLastError(null);

      const channel = ensureDownlinkChannel();
      const res = await invoke("p2p_init", { channel });
      const addr = res?.local_addr_json || "";

      setLocalAddrJson(addr);
      setInitialized(true);
      setP2pStatus("已初始化");
      appendLog("初始化完成");
      appendLog(`localAddrJson=${addr}`);
    } catch (e) {
      setP2pStatus("初始化失败");
      setLastError(e);
      appendLog(`初始化失败: ${e?.message || String(e)}`);
    }
  };

  const connectRemote = async () => {
    try {
      if (!remoteAddrJson) {
        throw new Error("请先填写远端地址 JSON");
      }

      setP2pStatus("连接中...");
      setConnected(false);
      setLastError(null);

      await invoke("p2p_connect", {
        remoteAddrJson,
      });

      await sleep(500);

      setP2pStatus("已发起连接");
      appendLog("已发起连接请求");
    } catch (e) {
      setConnected(false);
      setP2pStatus("连接失败");
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

          const rms = calcRmsInt16(frame);

          if (enableVad) {
            if (rms >= vadRmsThreshold) {
              vadSpeechStreakRef.current += 1;
              vadSilenceStreakRef.current = 0;
              if (vadSpeechStreakRef.current >= vadAttackFrames) {
                vadOpenRef.current = true;
              }
            } else {
              vadSpeechStreakRef.current = 0;
              vadSilenceStreakRef.current += 1;
              if (vadSilenceStreakRef.current > vadHangoverFrames) {
                vadOpenRef.current = false;
              }
            }
          } else {
            vadOpenRef.current = true;
          }

          if (vadOpenRef.current) {
            const bytes = Array.from(new Uint8Array(frame.buffer));
            sendQueueRef.current.push(bytes);
          } else {
            setMetrics((prev) => ({
              ...prev,
              vadDropped: prev.vadDropped + 1,
            }));
          }
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

      vadSpeechStreakRef.current = 0;
      vadSilenceStreakRef.current = 0;
      vadOpenRef.current = true;

      setIsCapturing(true);
      setCaptureStatus("正在采集/推送");
      appendLog("麦克风增强已开启: echoCancellation / noiseSuppression / autoGainControl");
      appendLog(
        `VAD ${enableVad ? "已开启" : "已关闭"}: threshold=${vadRmsThreshold}, hangover=${vadHangoverFrames}`
      );
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

      vadSpeechStreakRef.current = 0;
      vadSilenceStreakRef.current = 0;
      vadOpenRef.current = true;

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
      setInitialized(false);
      setP2pStatus("已关闭");
      resetJitterState();
      appendLog("连接已关闭");
    } catch (e) {
      setLastError(e);
      appendLog(`关闭失败: ${e?.message || String(e)}`);
    }
  }, [appendLog, resetJitterState, stopCapture]);

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

  const copyLocalAddr = useCallback(async () => {
    if (!localAddrJson) {
      throw new Error("请先初始化并获取本地地址");
    }
    await navigator.clipboard.writeText(localAddrJson);
    appendLog("已复制本地地址 JSON");
  }, [appendLog, localAddrJson]);

  const canConnect = useMemo(
    () => initialized && !!remoteAddrJson,
    [initialized, remoteAddrJson]
  );

  const canStartTalk = useMemo(
    () => initialized && connected && !isCapturing,
    [initialized, connected, isCapturing]
  );

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

    initialized,
    connected,
    isCapturing,

    canInit: !initialized,
    canConnect,
    canStartTalk,
    canStopTalk: isCapturing,
    canCopyAddr: !!localAddrJson,

    initNode,
    refreshLocalAddr,
    connectRemote,
    startCapture,
    stopCapture,
    closeNode,
    copyLocalAddr,
  };
}