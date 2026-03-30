import { useCallback, useEffect, useRef, useState } from "react";

function float32ToInt16(float32Array) {
  const int16Array = new Int16Array(float32Array.length);

  for (let i = 0; i < float32Array.length; i += 1) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  return int16Array;
}

function int16ToFloat32(int16Array) {
  const float32Array = new Float32Array(int16Array.length);

  for (let i = 0; i < int16Array.length; i += 1) {
    float32Array[i] = int16Array[i] / 0x8000;
  }

  return float32Array;
}

function int16ToUint8(int16Array) {
  return new Uint8Array(int16Array.buffer.slice(0));
}

function uint8ToInt16(uint8Array) {
  const buffer = uint8Array.buffer.slice(
    uint8Array.byteOffset,
    uint8Array.byteOffset + uint8Array.byteLength
  );
  return new Int16Array(buffer);
}

export function useMicPcmCapture({ onChunk, sampleRate = 48000 } = {}) {
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const processorNodeRef = useRef(null);
  const muteGainRef = useRef(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState("未开始");
  const [captureError, setCaptureError] = useState(null);
  const [sentFrameCount, setSentFrameCount] = useState(0);

  const startCapture = useCallback(async () => {
    try {
      setCaptureError(null);
      setCaptureStatus("正在申请麦克风权限...");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("当前环境不支持 getUserMedia");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
        },
        video: false,
      });

      const audioContext = new AudioContext({ sampleRate });

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const sourceNode = audioContext.createMediaStreamSource(stream);

      // ScriptProcessorNode 只能用特定 buffer size
      const processorNode = audioContext.createScriptProcessor(512, 1, 1);

      const muteGain = audioContext.createGain();
      muteGain.gain.value = 0;

      processorNode.onaudioprocess = async (event) => {
        try {
          const input = event.inputBuffer.getChannelData(0);
          const float32Frame = new Float32Array(input.length);
          float32Frame.set(input);

          const int16Frame = float32ToInt16(float32Frame);

          // 把 512 拆成两个 256，减小每个 datagram 大小
          const chunkSize = 256;

          for (let i = 0; i < int16Frame.length; i += chunkSize) {
            const subFrame = int16Frame.slice(i, i + chunkSize);
            const payload = int16ToUint8(subFrame);

            setSentFrameCount((prev) => prev + 1);

            if (onChunk) {
              await onChunk(payload, {
                int16Frame: subFrame,
                sampleRate: audioContext.sampleRate,
              });
            }
          }
        } catch (error) {
          console.error("PCM capture chunk error:", error);
        }
      };

      sourceNode.connect(processorNode);
      processorNode.connect(muteGain);
      muteGain.connect(audioContext.destination);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      sourceNodeRef.current = sourceNode;
      processorNodeRef.current = processorNode;
      muteGainRef.current = muteGain;

      setSentFrameCount(0);
      setIsCapturing(true);
      setCaptureStatus("PCM 采集中");
    } catch (error) {
      console.error("startCapture failed:", error);
      setCaptureError(error);
      setIsCapturing(false);
      setCaptureStatus(`启动失败：${error?.message || "未知错误"}`);
    }
  }, [onChunk, sampleRate]);

  const stopCapture = useCallback(async () => {
    try {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }

      if (processorNodeRef.current) {
        processorNodeRef.current.onaudioprocess = null;
        processorNodeRef.current.disconnect();
        processorNodeRef.current = null;
      }

      if (muteGainRef.current) {
        muteGainRef.current.disconnect();
        muteGainRef.current = null;
      }

      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    } catch (error) {
      console.error("stopCapture failed:", error);
    } finally {
      setIsCapturing(false);
      setCaptureStatus("已停止");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
      if (processorNodeRef.current) processorNodeRef.current.disconnect();
      if (muteGainRef.current) muteGainRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isCapturing,
    captureStatus,
    captureError,
    sentFrameCount,
    startCapture,
    stopCapture,
  };
}

export function useRemotePcmPlayback({ sampleRate = 48000 } = {}) {
  const audioContextRef = useRef(null);
  const nextPlayTimeRef = useRef(0);

  const [playbackStatus, setPlaybackStatus] = useState("未播放");
  const [playbackError, setPlaybackError] = useState(null);
  const [playedFrameCount, setPlayedFrameCount] = useState(0);

  const ensureContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate });
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (nextPlayTimeRef.current === 0) {
      nextPlayTimeRef.current = audioContextRef.current.currentTime + 0.05;
    }

    return audioContextRef.current;
  }, [sampleRate]);

  const playChunk = useCallback(
    async (payload) => {
      try {
        if (!payload) return;

        const context = await ensureContext();
        const uint8 = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
        const int16 = uint8ToInt16(uint8);
        const float32 = int16ToFloat32(int16);

        const audioBuffer = context.createBuffer(1, float32.length, sampleRate);
        audioBuffer.copyToChannel(float32, 0);

        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);

        const now = context.currentTime;
        const startAt = Math.max(now + 0.01, nextPlayTimeRef.current);

        source.start(startAt);
        nextPlayTimeRef.current = startAt + audioBuffer.duration;

        setPlayedFrameCount((prev) => prev + 1);
        setPlaybackStatus("播放中");
        setPlaybackError(null);
      } catch (error) {
        console.error("playChunk failed:", error);
        setPlaybackError(error);
        setPlaybackStatus("播放失败");
      }
    },
    [ensureContext, sampleRate]
  );

  const stopPlayback = useCallback(async () => {
    try {
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (error) {
      console.error("stopPlayback failed:", error);
    } finally {
      nextPlayTimeRef.current = 0;
      setPlaybackStatus("已停止");
    }
  }, []);

  const resetPlayback = useCallback(() => {
    nextPlayTimeRef.current = audioContextRef.current
      ? audioContextRef.current.currentTime + 0.05
      : 0;
    setPlayedFrameCount(0);
    setPlaybackStatus("已重置");
    setPlaybackError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    playbackStatus,
    playbackError,
    playedFrameCount,
    playChunk,
    stopPlayback,
    resetPlayback,
  };
}