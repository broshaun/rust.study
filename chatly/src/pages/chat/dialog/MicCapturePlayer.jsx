import { useEffect } from "react";
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

  const handleStart = async () => {
    try {
      resetPlayback();
      await openTransport();
      await startCapture();
    } catch (error) {
      console.error("handleStart failed:", error);
    }
  };

  const handleStop = async () => {
    await stopCapture();
    await closeTransport();
    await stopPlayback();
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h3>PCM 音频采集与播放</h3>

      <button
        onClick={isCapturing ? handleStop : handleStart}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        {isCapturing ? "🔴 停止采集" : "🎤 开始采集"}
      </button>

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