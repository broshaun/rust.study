import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Channel, invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useP2PTransport(options = {}) {
  const {
    initialRemoteAddr = "",
    pacingIntervalMs = 10,
    maxSendQueuePackets = 24,
  } = options;

  const downlinkChannelRef = useRef(null);
  const sendQueueRef = useRef([]);
  const sendLoopRunningRef = useRef(false);
  const messageHandlersRef = useRef(new Set());
  const packetSizeSamplesRef = useRef([]);

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
        console.error("transport onMessage handler error:", err);
      }
    }
  }, []);

  const onMessage = useCallback((handler) => {
    messageHandlersRef.current.add(handler);
    return () => {
      messageHandlersRef.current.delete(handler);
    };
  }, []);

  const startSendLoop = useCallback(() => {
    if (sendLoopRunningRef.current) return;
    sendLoopRunningRef.current = true;

    const loop = async () => {
      try {
        while (sendLoopRunningRef.current) {
          if (!connected) {
            await sleep(pacingIntervalMs);
            continue;
          }

          const packet = sendQueueRef.current.shift();

          if (packet) {
            try {
              await invoke("p2p_send", { data: packet });

              metricsCacheRef.current = {
                ...metricsCacheRef.current,
                sent: metricsCacheRef.current.sent + 1,
                queueDepth: sendQueueRef.current.length,
              };
            } catch (e) {
              setLastError(e);
              appendLog(`发送失败: ${e?.message || String(e)}`);
            }
          } else {
            metricsCacheRef.current = {
              ...metricsCacheRef.current,
              queueDepth: 0,
            };
          }

          await sleep(pacingIntervalMs);
        }
      } finally {
        sendLoopRunningRef.current = false;
      }
    };

    loop();
  }, [appendLog, connected, pacingIntervalMs]);

  const stopSendLoop = useCallback(() => {
    sendLoopRunningRef.current = false;
  }, []);

  const send = useCallback(
    (data) => {
      const bytes =
        data instanceof Uint8Array
          ? data
          : data instanceof ArrayBuffer
          ? new Uint8Array(data)
          : Array.isArray(data)
          ? new Uint8Array(data)
          : new Uint8Array([]);

      sendQueueRef.current.push(bytes);

      if (sendQueueRef.current.length > maxSendQueuePackets) {
        const dropCount = sendQueueRef.current.length - maxSendQueuePackets;
        sendQueueRef.current.splice(0, dropCount);

        metricsCacheRef.current = {
          ...metricsCacheRef.current,
          paceDropped: metricsCacheRef.current.paceDropped + dropCount,
          queueDepth: sendQueueRef.current.length,
        };
      } else {
        metricsCacheRef.current = {
          ...metricsCacheRef.current,
          queueDepth: sendQueueRef.current.length,
        };
      }

      startSendLoop();
    },
    [maxSendQueuePackets, startSendLoop]
  );

  const ensureDownlinkChannel = useCallback(() => {
    if (downlinkChannelRef.current) return downlinkChannelRef.current;

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

      metricsCacheRef.current = {
        ...metricsCacheRef.current,
        recv: metricsCacheRef.current.recv + 1,
      };

      emitMessage(bytes);
    };

    downlinkChannelRef.current = channel;
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
        setStatus("已连接");
        appendLog("连接成功");
        startSendLoop();
      });

      offClosed = await listen("p2p-closed", () => {
        setConnected(false);
        setInitialized(false);
        setStatus("已关闭");
        stopSendLoop();
        sendQueueRef.current = [];
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
      stopSendLoop();
      if (offLog) offLog();
      if (offReady) offReady();
      if (offConnected) offConnected();
      if (offClosed) offClosed();
      if (offPacket) offPacket();
    };
  }, [appendLog, startSendLoop, stopSendLoop]);

  const init = useCallback(async () => {
    try {
      setStatus("初始化中...");
      setLastError(null);

      const channel = ensureDownlinkChannel();
      const res = await invoke("p2p_init", { channel });
      const addr = res?.local_addr_json || "";

      setLocalAddrJson(addr);
      setInitialized(true);
      setStatus("已初始化");
      appendLog("初始化完成");
      appendLog(`localAddrJson=${addr}`);
    } catch (e) {
      setStatus("初始化失败");
      setLastError(e);
      appendLog(`初始化失败: ${e?.message || String(e)}`);
    }
  }, [appendLog, ensureDownlinkChannel]);

  const connect = useCallback(async () => {
    try {
      if (!remoteAddrJson) throw new Error("请先填写远端地址 JSON");

      setStatus("连接中...");
      setConnected(false);
      setLastError(null);

      await invoke("p2p_connect", { remoteAddrJson });
      await sleep(500);

      setStatus("已发起连接");
      appendLog("已发起连接请求");
    } catch (e) {
      setConnected(false);
      setStatus("连接失败");
      setLastError(e);
      appendLog(`连接失败: ${e?.message || String(e)}`);
    }
  }, [appendLog, remoteAddrJson]);

  const close = useCallback(async () => {
    try {
      stopSendLoop();
      await invoke("p2p_close");
      setConnected(false);
      setInitialized(false);
      setStatus("已关闭");
      sendQueueRef.current = [];
      metricsCacheRef.current = {
        ...metricsCacheRef.current,
        queueDepth: 0,
      };
      appendLog("连接已关闭");
    } catch (e) {
      setLastError(e);
      appendLog(`关闭失败: ${e?.message || String(e)}`);
    }
  }, [appendLog, stopSendLoop]);

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
    if (!localAddrJson) throw new Error("请先初始化并获取本地地址");
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