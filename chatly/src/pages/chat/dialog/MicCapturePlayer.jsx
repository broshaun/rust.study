import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAudioTransport } from "hooks/voice/useAudioTransport";
import { useMicPcmCapture, useRemotePcmPlayback } from "hooks/voice/usePcmAudio";

export function MicCapturePlayer() {
  const {
    transportStatus,
    lastError,
    openTransport,
    closeTransport,
    sendAudio,
    subscribe,
  } = useAudioTransport();

  const {
    isCapturing,
    captureStatus,
    captureError,
    sentFrameCount,
    startCapture,
    stopCapture,
  } = useMicPcmCapture({
    sampleRate: 48000,
    onChunk: async (payload) => {
      await sendAudio(payload);
    },
  });

  const {
    playbackStatus,
    playbackError,
    playedFrameCount,
    playChunk,
    stopPlayback,
    resetPlayback,
  } = useRemotePcmPlayback({
    sampleRate: 48000,
  });

  const [quicStatus, setQuicStatus] = useState("未初始化");
  const [bindAddr, setBindAddr] = useState("0.0.0.0:5000");
  const [remoteAddr, setRemoteAddr] = useState("127.0.0.1:5001");
  const [serverName, setServerName] = useState("localhost");
  const [nodeStarted, setNodeStarted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => {
    const unsubscribe = subscribe(async (message) => {
      try {
        if (!message?.type) return;

        if (message.type === "ready") {
          return;
        }

        if (message.type === "audioChunk") {
          const payload = message.data?.payload;
          if (payload) {
            await playChunk(payload);
          }
        }
      } catch (error) {
        console.error("处理下行消息失败:", error);
      }
    });

    return unsubscribe;
  }, [subscribe, playChunk]);

  const handleStartNode = async () => {
    try {
      setBusyAction("start-node");
      setQuicStatus(`正在启动节点: ${bindAddr}`);

      await invoke("quic_init_node", {
        bindAddr,
      });

      // 每个节点都要打开本地 transport，才能播放对方声音
      await openTransport();
      resetPlayback();

      setNodeStarted(true);
      setQuicStatus(`节点已启动: ${bindAddr}`);
    } catch (error) {
      console.error("quic_init_node failed:", error);
      setNodeStarted(false);
      setQuicStatus(`节点启动失败: ${error?.message || String(error)}`);
    } finally {
      setBusyAction("");
    }
  };

  const handleConnect = async () => {
    try {
      if (!nodeStarted) {
        window.alert("请先启动节点。");
        return;
      }

      setBusyAction("connect");
      setQuicStatus(`正在连接远端 ${remoteAddr} ...`);

      await invoke("quic_connect", {
        remoteAddr,
        serverName,
      });

      setConnected(true);
      setQuicStatus(`已连接到 ${remoteAddr}`);
    } catch (error) {
      console.error("quic_connect failed:", error);
      setConnected(false);
      setQuicStatus(`连接失败: ${error?.message || String(error)}`);
    } finally {
      setBusyAction("");
    }
  };

  const handleCloseNode = async () => {
    try {
      setBusyAction("close");
      setQuicStatus("正在关闭节点...");

      if (isCapturing) {
        await stopCapture();
      }

      await closeTransport();
      await stopPlayback();
      await invoke("quic_close");

      setNodeStarted(false);
      setConnected(false);
      setQuicStatus("节点已关闭");
    } catch (error) {
      console.error("quic_close failed:", error);
      setQuicStatus(`关闭失败: ${error?.message || String(error)}`);
    } finally {
      setBusyAction("");
    }
  };

  const handleStartTalk = async () => {
    try {
      if (!nodeStarted) {
        window.alert("请先启动节点。");
        return;
      }

      await startCapture();
    } catch (error) {
      console.error("handleStartTalk failed:", error);
    }
  };

  const handleStopTalk = async () => {
    await stopCapture();
  };

  const canStartNode = !busyAction && !nodeStarted;
  const canConnect = !busyAction && nodeStarted && !connected;
  const canCloseNode = !busyAction && nodeStarted;
  const canStartTalk = !busyAction && nodeStarted && !isCapturing;

  return (
    <div style={{ padding: "20px", textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
      <h3>双向语音通话（像电话一样）</h3>

      <div
        style={{
          marginBottom: "16px",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          textAlign: "left",
        }}
      >
        <p><strong>节点状态：</strong>{nodeStarted ? "已启动" : "未启动"}</p>
        <p><strong>连接状态：</strong>{connected ? "已连接" : "未连接"}</p>
      </div>

      <div style={{ textAlign: "left", marginBottom: "16px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>本地绑定地址</label>
          <input
            value={bindAddr}
            onChange={(e) => setBindAddr(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            placeholder="例如：0.0.0.0:5000"
            disabled={nodeStarted || !!busyAction}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>远端地址</label>
          <input
            value={remoteAddr}
            onChange={(e) => setRemoteAddr(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            placeholder="例如：127.0.0.1:5001"
            disabled={!nodeStarted || !!busyAction}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>Server Name</label>
          <input
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            placeholder="例如：localhost"
            disabled={!nodeStarted || !!busyAction}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <button
          onClick={handleStartNode}
          disabled={!canStartNode}
          style={{ padding: "10px 16px", cursor: canStartNode ? "pointer" : "not-allowed" }}
        >
          启动节点
        </button>

        <button
          onClick={handleConnect}
          disabled={!canConnect}
          style={{ padding: "10px 16px", cursor: canConnect ? "pointer" : "not-allowed" }}
        >
          连接远端
        </button>

        <button
          onClick={handleCloseNode}
          disabled={!canCloseNode}
          style={{ padding: "10px 16px", cursor: canCloseNode ? "pointer" : "not-allowed" }}
        >
          关闭节点
        </button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={isCapturing ? handleStopTalk : handleStartTalk}
          disabled={isCapturing ? false : !canStartTalk}
          style={{
            padding: "10px 20px",
            cursor: isCapturing || canStartTalk ? "pointer" : "not-allowed",
          }}
        >
          {isCapturing ? "🔴 停止讲话" : "🎤 开始讲话"}
        </button>
      </div>

      <p style={{ color: "#666" }}>
        QUIC 状态: {quicStatus}
      </p>

      <p style={{ color: isCapturing ? "green" : "#666" }}>
        采集状态: {captureStatus}
      </p>

      <p style={{ color: "#666" }}>
        传输状态: {transportStatus}
      </p>

      <p style={{ color: "#666" }}>
        已发送帧数: {sentFrameCount}
      </p>

      <p style={{ color: "#666" }}>
        播放状态: {playbackStatus}
      </p>

      <p style={{ color: "#666" }}>
        已播放帧数: {playedFrameCount}
      </p>

      {captureError ? (
        <p style={{ color: "red" }}>
          采集错误: {captureError.message || String(captureError)}
        </p>
      ) : null}

      {lastError ? (
        <p style={{ color: "red" }}>
          传输错误: {lastError.message || String(lastError)}
        </p>
      ) : null}

      {playbackError ? (
        <p style={{ color: "red" }}>
          播放错误: {playbackError.message || String(playbackError)}
        </p>
      ) : null}
    </div>
  );
}