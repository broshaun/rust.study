import React from "react";
import { useQuicPcmVoice } from "hooks/voice/useQuicPcmVoice";

export function PcmVoicePage({ useJitterBuffer = true }) {
  // 结构化 Hook 数据
  const voice = useQuicPcmVoice({
    useJitterBuffer,
    initialBindAddr: "0.0.0.0:6000",
    initialRemoteAddr: "127.0.0.1:6001",
    initialServerName: "localhost",
  });

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header Section */}
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>QUIC PCM 语音控制台</h1>
            <p style={subtitleStyle}>
              {useJitterBuffer ? "状态：已开启抖动缓冲区 (Jitter Buffer)" : "状态：实时直连模式"}
            </p>
          </div>
          <div style={badgeStyle(voice.connected)}>
            {voice.connected ? "● 已连接" : "○ 未连接"}
          </div>
        </div>

        {/* Status Row */}
        <div style={statusGridStyle}>
          <StatusCard label="网关状态" value={voice.quicStatus} icon="🌐" />
          <StatusCard label="采集状态" value={voice.captureStatus} icon="🎤" />
          <StatusCard label="播放状态" value={voice.playbackStatus} icon="🔊" />
        </div>

        {/* Configuration Section */}
        <Section title="网络配置">
          <div style={formGridStyle}>
            <FormItem label="本地绑定">
              <Input value={voice.bindAddr} onChange={(e) => voice.setBindAddr(e.target.value)} placeholder="0.0.0.0:6000" />
            </FormItem>
            <FormItem label="远端地址">
              <Input value={voice.remoteAddr} onChange={(e) => voice.setRemoteAddr(e.target.value)} placeholder="127.0.0.1:6001" />
            </FormItem>
            <FormItem label="服务名称">
              <Input value={voice.serverName} onChange={(e) => voice.setServerName(e.target.value)} placeholder="localhost" />
            </FormItem>
          </div>
          <div style={buttonGroupStyle}>
            <PrimaryButton onClick={voice.initNode} disabled={!voice.canInit}>启动节点</PrimaryButton>
            <PrimaryButton onClick={voice.connectRemote} disabled={!voice.canConnect}>建立连接</PrimaryButton>
            <DangerButton onClick={voice.closeNode}>重置并关闭</DangerButton>
          </div>
        </Section>

        {/* Interaction Section */}
        <Section title="通话控制">
          <div style={buttonGroupStyle}>
            <TalkButton onClick={voice.startCapture} disabled={!voice.canStartTalk}>
              开始推送语音
            </TalkButton>
            <StopButton onClick={voice.stopCapture} disabled={!voice.canStopTalk}>
              停止推送
            </StopButton>
          </div>
        </Section>

        {/* Metrics Section */}
        <Section title="实时数据监控">
          <div style={metricGridStyle}>
            <MetricCard label="TX (已发送)" value={voice.sentFrameCount} unit="frames" color="#2563eb" />
            <MetricCard label="RX (已接收)" value={voice.recvFrameCount} unit="frames" color="#059669" />
            <MetricCard label="Played" value={voice.playedFrameCount} unit="frames" color="#7c3aed" />
            <MetricCard label="Buffer" value={voice.bufferedFrameCount} unit="frames" color={voice.bufferedFrameCount > 15 ? "#dc2626" : "#4b5563"} />
          </div>
        </Section>

        {/* Error Notifications */}
        {(voice.lastError || voice.playbackError) && (
          <div style={errorContainerStyle}>
            {voice.lastError && <ErrorBox title="系统错误" message={voice.lastError} />}
            {voice.playbackError && <ErrorBox title="播放异常" message={voice.playbackError} />}
          </div>
        )}
      </div>
    </div>
  );
}

// --- 抽象子组件 ---

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={sectionTitleStyle}>{title}</div>
      {children}
    </div>
  );
}

function FormItem({ label, children }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      {children}
    </div>
  );
}

function StatusCard({ label, value, icon }) {
  return (
    <div style={statusCardStyle}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div style={{ marginLeft: 8 }}>
        <div style={statusLabelStyle}>{label}</div>
        <div style={statusValueStyle}>{value}</div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, color }) {
  return (
    <div style={metricCardStyle}>
      <div style={metricLabelStyle}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <div style={{ ...metricValueStyle, color }}>{value}</div>
        <div style={metricUnitStyle}>{unit}</div>
      </div>
    </div>
  );
}

function ErrorBox({ title, message }) {
  return (
    <div style={errorBoxStyle}>
      <span style={{ fontWeight: 700 }}>{title}:</span> {message.message || String(message)}
    </div>
  );
}

// --- 基础原子组件 ---

const Input = (props) => (
  <input {...props} style={inputStyle} />
);

const PrimaryButton = ({ children, disabled, ...props }) => (
  <button {...props} disabled={disabled} style={btnBase(disabled, "#111827", "#fff")}>{children}</button>
);

const DangerButton = ({ ...props }) => (
  <button {...props} style={btnBase(false, "#fff", "#dc2626", "1px solid #fecaca")}>关闭</button>
);

const TalkButton = ({ disabled, ...props }) => (
  <button {...props} disabled={disabled} style={btnAction(disabled, "#2563eb")}>🎤 开始讲话</button>
);

const StopButton = ({ disabled, ...props }) => (
  <button {...props} disabled={disabled} style={btnAction(disabled, "#dc2626")}>⏹ 停止</button>
);

// --- 样式对象 (JSS) ---

const containerStyle = {
  maxWidth: 800,
  margin: "40px auto",
  padding: "0 20px",
  fontFamily: 'Inter, system-ui, sans-serif',
};

const cardStyle = {
  background: "#fff",
  borderRadius: 16,
  padding: 32,
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  border: "1px solid #f3f4f6",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 28,
  borderBottom: "1px solid #f3f4f6",
  paddingBottom: 20,
};

const titleStyle = { fontSize: 24, fontWeight: 800, margin: 0, color: "#111827", letterSpacing: "-0.025em" };
const subtitleStyle = { fontSize: 13, color: "#6b7280", margin: "4px 0 0 0" };

const badgeStyle = (active) => ({
  padding: "4px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  background: active ? "#ecfdf5" : "#f3f4f6",
  color: active ? "#059669" : "#6b7280",
  transition: "all 0.3s ease",
});

const statusGridStyle = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 };
const statusCardStyle = { display: "flex", alignItems: "center", padding: 12, background: "#f9fafb", borderRadius: 12, border: "1px solid #f3f4f6" };
const statusLabelStyle = { fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" };
const statusValueStyle = { fontSize: 13, fontWeight: 600, color: "#1f2937" };

const sectionTitleStyle = { fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 16, display: "flex", alignItems: "center" };
const formGridStyle = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#4b5563", marginBottom: 6 };
const inputStyle = { width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", transition: "border-color 0.2s" };

const buttonGroupStyle = { display: "flex", gap: 10, flexWrap: "wrap" };
const btnBase = (disabled, bg, color, border = "none") => ({
  height: 38, padding: "0 18px", borderRadius: 8, border, background: disabled ? "#e5e7eb" : bg, color, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", transition: "opacity 0.2s"
});

const btnAction = (disabled, bg) => ({
  height: 44, padding: "0 24px", borderRadius: 12, border: "none", background: bg, color: "#fff", fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, boxShadow: disabled ? "none" : `0 4px 12px ${bg}44`
});

const metricGridStyle = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 };
const metricCardStyle = { padding: 16, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 };
const metricLabelStyle = { fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 4, textTransform: "uppercase" };
const metricValueStyle = { fontSize: 22, fontWeight: 800 };
const metricUnitStyle = { fontSize: 11, color: "#9ca3af", marginLeft: 4 };

const errorContainerStyle = { marginTop: 24, display: "flex", flexDirection: "column", gap: 8 };
const errorBoxStyle = { padding: "12px 16px", borderRadius: 8, background: "#fff1f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 };