import { useRef, useState, useEffect } from "react";

export function MicCapturePlayer() {
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  // 核心：切换采集状态
  const toggleCapture = async () => {
    if (isRunning) {
      // 停止逻辑
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (audioRef.current) audioRef.current.srcObject = null;
      setIsRunning(false);
    } else {
      // 启动逻辑
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
          // 处理浏览器自动播放限制
          audioRef.current.play().catch(e => console.error("播放被拦截:", e));
        }
        setIsRunning(true);
      } catch (e) {
        alert(`麦克风启动失败: ${e.message}`);
      }
    }
  };

  // 组件销毁时强制关闭麦克风，防止隐私泄露
  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h3>音频采集预览</h3>

      <button
        onClick={toggleCapture}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        {isRunning ? "🔴 停止采集" : "🎤 开始采集"}
      </button>

      <div style={{ marginTop: "15px" }}>
        <audio ref={audioRef} autoPlay playsInline controls style={{ borderRadius: "8px" }} />
      </div>

      <p style={{ color: isRunning ? "green" : "#666" }}>
        状态: {isRunning ? "正在直播中..." : "未就绪"}
      </p>
    </div>
  );
}