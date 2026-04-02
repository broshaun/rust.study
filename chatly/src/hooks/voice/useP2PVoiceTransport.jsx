import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Channel, invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";


// 音频数据传输
export function useP2PVoiceTransport(options = {}) {
  const {
    initialRemoteAddr = "",
    maxPendingSends = 4,
  } = options;

  const rawDownlinkChannelRef = useRef(null);
  const voiceDownlinkChannelRef = useRef(null);
  const messageHandlersRef = useRef(new Set());
  const packetSizeSamplesRef = useRef([]);
  const connectedRef = useRef(false);
  const sendingRef = useRef(false);
  const pendingSendsRef = useRef(0);

  const [localAddrJson, setLocalAddrJson] = useState("");
  const [remoteAddrJson, setRemoteAddrJson] = useState(initialRemoteAddr);

  const [initialized, setInitialized] = useState(false);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("未初始化");
  const [logs, setLogs] = useState([]);
  const [lastError, setLastError] = useState(null);

  const [metrics, setMetrics] = useState({
    sent: 0,
    recv: 0,
    queueDepth: 0,
    lastPayloadBytes: 0,
    avgPayloadBytes: 0,
    paceDropped: 0,
  });

  const metricsCacheRef = useRef({
    sent: 0,
    recv: 0,
    queueDepth: 0,
    lastPayloadBytes: 0,
    avgPayloadBytes: 0,
    paceDropped: 0,
  });

  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  const appendLog = useCallback((text) => {
    setLogs((prev) => {
      const next = [...prev, `[${new Date().toLocaleTimeString()}] ${text}`];
      return next.slice(-250);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics({ ...metricsCacheRef.current });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const emitMessage = useCallback((data) => {
    for (const handler of messageHandlersRef.current) {
      try {
        handler(data);
      } catch (err) {
        console.error("voice transport onMessage handler error:", err);
      }
    }
  }, []);

  const onMessage = useCallback((handler) => {
    messageHandlersRef.current.add(handler);
    return () => {
      messageHandlersRef.current.delete(handler);
    };
  }, []);

  const send = useCallback(
    async (data) => {
      const bytes =
        data instanceof Uint8Array
          ? data
          : data instanceof ArrayBuffer
          ? new Uint8Array(data)
          : Array.isArray(data)
          ? new Uint8Array(data)
          : new Uint8Array([]);

      if (!bytes.length) return;
      if (!connectedRef.current) return;

      // 保护：如果前面 invoke 堵住了，不要无限堆
      if (pendingSendsRef.current >= maxPendingSends) {
        metricsCacheRef.current = {
          ...metricsCacheRef.current,
          paceDropped: metricsCacheRef.current.paceDropped + 1,
          queueDepth: pendingSendsRef.current,
        };
        return;
      }

      pendingSendsRef.current += 1;
      sendingRef.current = true;

      metricsCacheRef.current = {
        ...metricsCacheRef.current,
        queueDepth: pendingSendsRef.current,
      };

      try {
        await invoke("p2p_voice_send_pcm", { data: Array.from(bytes) });

        metricsCacheRef.current = {
          ...metricsCacheRef.current,
          sent: metricsCacheRef.current.sent + 1,
          queueDepth: pendingSendsRef.current - 1,
        };
      } catch (e) {
        setLastError(e);
        appendLog(`语音发送失败: ${e?.message || String(e)}`);
      } finally {
        pendingSendsRef.current = Math.max(0, pendingSendsRef.current - 1);
        metricsCacheRef.current = {
          ...metricsCacheRef.current,
          queueDepth: pendingSendsRef.current,
        };
        if (pendingSendsRef.current === 0) {
          sendingRef.current = false;
        }
      }
    },
    [appendLog, maxPendingSends]
  );

  const ensureRawDownlinkChannel = useCallback(() => {
    if (rawDownlinkChannelRef.current) return rawDownlinkChannelRef.current;

    const channel = new Channel();

    channel.onmessage = async (message) => {
      let bytes;

      if (message instanceof Uint8Array) {
        bytes = message;
      } else if (Array.isArray(message)) {
        bytes = new Uint8Array(message);
      } else {
        bytes = new Uint8Array(message || []);
      }

      metricsCacheRef.current = {
        ...metricsCacheRef.current,
        recv: metricsCacheRef.current.recv + 1,
      };

      try {
        await invoke("p2p_voice_push_raw_packet", {
          data: Array.from(bytes),
        });
      } catch (e) {
        setLastError(e);
        appendLog(`原始语音包处理失败: ${e?.message || String(e)}`);
      }
    };

    rawDownlinkChannelRef.current = channel;
    return channel;
  }, [appendLog]);

  const ensureVoiceDownlinkChannel = useCallback(() => {
    if (voiceDownlinkChannelRef.current) return voiceDownlinkChannelRef.current;

    const channel = new Channel();

    channel.onmessage = (message) => {
      let bytes;

      if (message instanceof Uint8Array) {
        bytes = message;
      } else if (Array.isArray(message)) {
        bytes = new Uint8Array(message);
      } else {
        bytes = new Uint8Array(message || []);
      }

      emitMessage(bytes);
    };

    voiceDownlinkChannelRef.current = channel;
    return channel;
  }, [emitMessage]);

  useEffect(() => {
    let offLog;
    let offReady;
    let offConnected;
    let offClosed;
    let offPacket;

    const bindEvents = async () => {
      offLog = await listen("p2p-log", (event) => {
        appendLog(String(event.payload ?? ""));
      });

      offReady = await listen("p2p-ready", () => {
        setInitialized(true);
        setStatus("已初始化");
      });

      offConnected = await listen("p2p-connected", () => {
        setConnected(true);
        connectedRef.current = true;
        setStatus("已连接");
        appendLog("连接成功");
      });

      offClosed = await listen("p2p-closed", () => {
        setConnected(false);
        connectedRef.current = false;
        setInitialized(false);
        setStatus("已关闭");
        pendingSendsRef.current = 0;
        metricsCacheRef.current = {
          ...metricsCacheRef.current,
          queueDepth: 0,
        };
        appendLog("连接已关闭");
      });

      offPacket = await listen("p2p-packet", (event) => {
        const pkt = event.payload || {};
        const payloadLen = Number(pkt.payload_len || 0);

        if (payloadLen > 0) {
          packetSizeSamplesRef.current.push(payloadLen);
          if (packetSizeSamplesRef.current.length > 30) {
            packetSizeSamplesRef.current.shift();
          }

          const avgPayloadBytes =
            packetSizeSamplesRef.current.reduce((a, b) => a + b, 0) /
            packetSizeSamplesRef.current.length;

          metricsCacheRef.current = {
            ...metricsCacheRef.current,
            lastPayloadBytes: payloadLen,
            avgPayloadBytes: Math.round(avgPayloadBytes),
          };
        }
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
  }, [appendLog]);

  const init = useCallback(async () => {
    try {
      setStatus("初始化中...");
      setLastError(null);

      const rawChannel = ensureRawDownlinkChannel();
      const voiceChannel = ensureVoiceDownlinkChannel();

      const res = await invoke("p2p_init", { channel: rawChannel });
      await invoke("p2p_voice_set_downlink", { channel: voiceChannel });

      const addr = res?.local_addr_json || "";

      setLocalAddrJson(addr);
      setInitialized(true);
      setStatus("已初始化");
      appendLog("语音传输初始化完成");
      appendLog(`localAddrJson=${addr}`);
    } catch (e) {
      setStatus("初始化失败");
      setLastError(e);
      appendLog(`初始化失败: ${e?.message || String(e)}`);
    }
  }, [appendLog, ensureRawDownlinkChannel, ensureVoiceDownlinkChannel]);

  const connect = useCallback(async () => {
    try {
      if (!remoteAddrJson) throw new Error("请先填写远端地址 JSON");

      setStatus("连接中...");
      setConnected(false);
      connectedRef.current = false;
      setLastError(null);

      await invoke("p2p_connect", { remoteAddrJson });

      setStatus("已发起连接");
      appendLog("已发起连接请求");
    } catch (e) {
      setConnected(false);
      connectedRef.current = false;
      setStatus("连接失败");
      setLastError(e);
      appendLog(`连接失败: ${e?.message || String(e)}`);
    }
  }, [appendLog, remoteAddrJson]);

  const close = useCallback(async () => {
    try {
      pendingSendsRef.current = 0;
      connectedRef.current = false;

      await invoke("p2p_voice_close");
      await invoke("p2p_close");

      setConnected(false);
      setInitialized(false);
      setStatus("已关闭");

      metricsCacheRef.current = {
        ...metricsCacheRef.current,
        queueDepth: 0,
      };

      appendLog("语音连接已关闭");
    } catch (e) {
      setLastError(e);
      appendLog(`关闭失败: ${e?.message || String(e)}`);
    }
  }, [appendLog]);

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

  return {
    localAddrJson,
    remoteAddrJson,
    setRemoteAddrJson,

    status,
    logs,
    metrics,
    lastError,

    initialized,
    connected,

    canInit: !initialized,
    canConnect,
    canCopyAddr: !!localAddrJson,

    init,
    connect,
    close,
    send,
    onMessage,
    refreshLocalAddr,
    copyLocalAddr,
  };
}