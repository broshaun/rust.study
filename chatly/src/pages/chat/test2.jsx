import { usePcmCapture } from "hooks/voice/usePcmCapture";
import { usePcmPlayback } from "hooks/voice/usePcmPlayback";


export function PcmTestPage() {
  
  const playback = usePcmPlayback({
    sampleRate: 48000,
    frameSamples: 480,
    defaultPlaying: false,
  });

  const capture = usePcmCapture({
    sampleRate: 48000,
    frameSamples: 480,
    onData: (bytes) => {
        playback.pushBytes(bytes);
    },
  });

  const stopAll = async () => {
    await capture.stopCapture();
    await playback.stop();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>PCM Test</h2>

      <button onClick={capture.startCapture} disabled={capture.isCapturing}>
        开始采集
      </button>

      <button onClick={capture.stopCapture} disabled={!capture.isCapturing}>
        停止采集
      </button>
    
    <br/>
      <button onClick={playback.start} disabled={playback.isPlayingEnabled}>
        开启播放
      </button>

      <button onClick={playback.stop} disabled={!playback.isPlayingEnabled}>
        停止播放并释放
      </button>

      <button onClick={stopAll}>全部停止</button>

      <p>采集状态：{capture.status}</p>
      <p>播放开关：{playback.isPlayingEnabled ? "ON" : "OFF"}</p>
      <p>播放状态：{playback.status}</p>

      {capture.error && (
        <p style={{ color: "red" }}>
          采集错误：{capture.error.message || String(capture.error)}
        </p>
      )}

      {playback.error && (
        <p style={{ color: "red" }}>
          播放错误：{playback.error.message || String(playback.error)}
        </p>
      )}
    </div>
  );
}