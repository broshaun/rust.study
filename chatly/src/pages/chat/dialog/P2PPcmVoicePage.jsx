import React from "react";
import { useP2PPcmVoice } from "hooks/voice/useP2PPcmVoice";

export function P2PPcmVoicePage({ useJitterBuffer = true }) {
  const v = useP2PPcmVoice({ useJitterBuffer });

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif", color: "#333" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <h2 style={{ marginTop: 0 }}>P2P 语音控制台</h2>

        {/* 状态栏 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          <Box label="网络状态" value={v.p2pStatus} color={v.connected ? "#059669" : "#6b7280"} />
          <Box label="麦克风" value={v.captureStatus} color={v.isCapturing ? "#2563eb" : "#6b7280"} />
          <Box label="连接状态" value={v.connected ? "已连接" : "未连接"} color={v.connected ? "#059669" : "#6b7280"} />
        </div>

        {/* 配置区 */}
        <div style={{ background: "#f9fafb", padding: 16, borderRadius: 12, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 16 }}>
            <Input
              label="远端 PeerId / Multiaddr"
              value={v.remotePeerId}
              onChange={e => v.setRemotePeerId(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={v.initNode} disabled={!v.canInit} primary>启动节点</Button>
            <Button onClick={v.connectRemote} disabled={!v.canConnect}>建立连接</Button>
            <Button onClick={v.closeNode} danger>重置关闭</Button>
          </div>
        </div>

        {/* 通话区 */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <LargeButton onClick={v.startCapture} disabled={!v.canStartTalk} color="#2563eb">
            开始讲话
          </LargeButton>
          <LargeButton onClick={v.stopCapture} disabled={!v.canStopTalk} color="#dc2626">
            停止
          </LargeButton>
        </div>

        {/* 数据监控 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, borderTop: "1px solid #eee", paddingTop: 20 }}>
          <Metric label="已发送" value={v.metrics.sent} />
          <Metric label="已接收" value={v.metrics.recv} />
          <Metric label="已播放" value={v.metrics.played} />
          <Metric label="缓冲中" value={v.metrics.buffered} />
        </div>

        {v.lastError && (
          <div style={{
            marginTop: 20,
            padding: 12,
            background: "#fff1f2",
            color: "#b91c1c",
            borderRadius: 8,
            fontSize: 13
          }}>
            错误提示: {v.lastError.message || String(v.lastError)}
          </div>
        )}
      </div>
    </div>
  );
}

const Box = ({ label, value, color }) => (
  <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
    <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>{label}</div>
    <div style={{ fontWeight: "bold", color }}>{value}</div>
  </div>
);

const Metric = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 11, color: "#999" }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: "bold" }}>{value}</div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <div style={{ fontSize: 12, fontWeight: "bold", marginBottom: 4 }}>{label}</div>
    <input
      {...props}
      style={{
        width: "100%",
        padding: "8px",
        borderRadius: 6,
        border: "1px solid #ddd",
        boxSizing: "border-box"
      }}
    />
  </div>
);

const Button = ({ children, primary, danger, disabled, ...props }) => (
  <button
    {...props}
    disabled={disabled}
    style={{
      padding: "8px 16px",
      borderRadius: 8,
      border: "none",
      fontWeight: "bold",
      cursor: disabled ? "not-allowed" : "pointer",
      background: primary ? "#111827" : danger ? "#fee2e2" : "#eee",
      color: primary ? "#fff" : danger ? "#b91c1c" : "#333",
      opacity: disabled ? 0.5 : 1
    }}
  >
    {children}
  </button>
);

const LargeButton = ({ children, color, disabled, ...props }) => (
  <button
    {...props}
    disabled={disabled}
    style={{
      flex: 1,
      padding: "14px",
      borderRadius: 12,
      border: "none",
      color: "#fff",
      fontWeight: "bold",
      background: color,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      fontSize: 16
    }}
  >
    {children}
  </button>
);