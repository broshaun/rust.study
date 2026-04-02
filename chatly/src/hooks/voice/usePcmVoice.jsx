import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

function createVoiceProcessorUrl() {
  const code = `
    class VoiceProcessor extends AudioWorkletProcessor {
      process(inputs) {
        const input = inputs && inputs[0] && inputs[0][0];
        if (!input || input.length === 0) return true;

        const int16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          let s = input[i];
          if (s > 1) s = 1;
          if (s < -1) s = -1;
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        this.port.postMessage(int16.buffer, [int16.buffer]);
        return true;
      }
    }

    registerProcessor("voice-processor", VoiceProcessor);
  `;

  return URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
}

export function usePcmVoice(options = {}) {
  const {
    sampleRate = 48000,
    frameSamples = 480,

    minBufferFrames = 3,
    maxBufferFrames = 12,

    enableVad = false,
    vadRmsThreshold = 0.012,
    vadHangoverFrames = 6,
    vadAttackFrames = 1,

    sendPacket,
    subscribePacket,
  } = options;

  const streamRef = useRef(null);
  const captureContextRef = useRef(null);
  const playbackContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const workletUrlRef = useRef(null);

  const nextPlayTimeRef = useRef(0);
  const drainingRef = useRef(false);

  const captureCarryRef = useRef(new Int16Array(0));
  const playbackQueueRef = useRef([]);

  const vadSpeechStreakRef = useRef(0);
  const vadSilenceStreakRef = useRef(0);
  const vadOpenRef = useRef(true);

  const [captureStatus, setCaptureStatus] = useState("未开始");
  const [playbackStatus, setPlaybackStatus] = useState("等待音频");
  const [isCapturing, setIsCapturing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [lastError, setLastError] = useState(null);

  const [metrics, setMetrics] = useState({
    sentFrames: 0,
    recvFrames: 0,
    played: 0,
    buffered: 0,
    vadDropped: 0,
  });

  const metricsCacheRef = useRef({
    sentFrames: 0,
    recvFrames: 0,
    played: 0,
    buffered: 0,
    vadDropped: 0,
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

  const playNext = useCallback(async () => {
    if (drainingRef.current) return;
    if (playbackQueueRef.current.length < minBufferFrames) return;

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

      let playedInc = 0;

      while (playbackQueueRef.current.length > 0) {
        const int16 = playbackQueueRef.current.shift();

        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / 0x8000;
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
        playedInc += 1;
      }

      metricsCacheRef.current = {
        ...metricsCacheRef.current,
        played: metricsCacheRef.current.played + playedInc,
        buffered: playbackQueueRef.current.length,
      };

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
  }, [appendLog, minBufferFrames, sampleRate]);

  const handleIncomingPacket = useCallback(
    (packet) => {
      try {
        const bytes =
          packet instanceof Uint8Array
            ? packet
            : packet instanceof ArrayBuffer
            ? new Uint8Array(packet)
            : Array.isArray(packet)
            ? new Uint8Array(packet)
            : new Uint8Array([]);

        if (!bytes.length) return;

        const int16 = new Int16Array(
          bytes.buffer,
          bytes.byteOffset,
          Math.floor(bytes.byteLength / 2)
        );

        const frame = new Int16Array(int16.length);
        frame.set(int16);

        playbackQueueRef.current.push(frame);

        if (playbackQueueRef.current.length > maxBufferFrames) {
          const dropCount = playbackQueueRef.current.length - maxBufferFrames;
          playbackQueueRef.current.splice(0, dropCount);
          nextPlayTimeRef.current = 0;
        }

        metricsCacheRef.current = {
          ...metricsCacheRef.current,
          recvFrames: metricsCacheRef.current.recvFrames + 1,
          buffered: playbackQueueRef.current.length,
        };

        playNext();
      } catch (e) {
        setLastError(e);
        appendLog(`处理来包失败: ${e?.message || String(e)}`);
      }
    },
    [appendLog, maxBufferFrames, playNext]
  );

  useEffect(() => {
    const unsub = subscribePacket?.(handleIncomingPacket);

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [handleIncomingPacket, subscribePacket]);

  const startCapture = useCallback(async () => {
    try {
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

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const workletUrl = createVoiceProcessorUrl();
      workletUrlRef.current = workletUrl;

      await ctx.audioWorklet.addModule(workletUrl);

      const source = ctx.createMediaStreamSource(stream);
      const processor = new AudioWorkletNode(ctx, "voice-processor", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 1,
      });

      const mute = ctx.createGain();
      mute.gain.value = 0;

      processor.port.onmessage = (e) => {
        const raw =
          e.data instanceof ArrayBuffer ? new Int16Array(e.data) : new Int16Array(0);

        if (raw.length === 0) return;

        let merged = concatInt16(captureCarryRef.current, raw);

        while (merged.length >= frameSamples) {
          const frame = merged.slice(0, frameSamples);
          merged = merged.slice(frameSamples);

          if (enableVad) {
            const rms = calcRmsInt16(frame);

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
            const bytes = new Uint8Array(frame.buffer.slice(0));
            sendPacket?.(bytes);

            metricsCacheRef.current = {
              ...metricsCacheRef.current,
              sentFrames: metricsCacheRef.current.sentFrames + 1,
            };
          } else {
            metricsCacheRef.current = {
              ...metricsCacheRef.current,
              vadDropped: metricsCacheRef.current.vadDropped + 1,
            };
          }
        }

        captureCarryRef.current = merged;
      };

      source.connect(processor);
      processor.connect(mute);
      mute.connect(ctx.destination);

      streamRef.current = stream;
      captureContextRef.current = ctx;
      workletNodeRef.current = processor;
      captureCarryRef.current = new Int16Array(0);

      vadSpeechStreakRef.current = 0;
      vadSilenceStreakRef.current = 0;
      vadOpenRef.current = true;

      setIsCapturing(true);
      setCaptureStatus("正在采集/发送");
      appendLog("开始讲话");
    } catch (e) {
      setCaptureStatus("采集失败");
      setLastError(e);
      appendLog(`采集失败: ${e?.message || String(e)}`);
    }
  }, [
    appendLog,
    enableVad,
    frameSamples,
    sampleRate,
    sendPacket,
    vadAttackFrames,
    vadHangoverFrames,
    vadRmsThreshold,
  ]);

  const stopCapture = useCallback(async () => {
    try {
      if (workletNodeRef.current) {
        workletNodeRef.current.port.onmessage = null;
        workletNodeRef.current.disconnect();
        workletNodeRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (captureContextRef.current) {
        await captureContextRef.current.close();
        captureContextRef.current = null;
      }

      if (workletUrlRef.current) {
        URL.revokeObjectURL(workletUrlRef.current);
        workletUrlRef.current = null;
      }

      captureCarryRef.current = new Int16Array(0);
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

  const resetPlayback = useCallback(() => {
    playbackQueueRef.current = [];
    nextPlayTimeRef.current = 0;
    metricsCacheRef.current = {
      ...metricsCacheRef.current,
      buffered: 0,
    };
    setPlaybackStatus("等待音频");
  }, []);

  useEffect(() => {
    return () => {
      workletNodeRef.current?.disconnect?.();
      streamRef.current?.getTracks?.().forEach((t) => t.stop());
      captureContextRef.current?.close?.();
      playbackContextRef.current?.close?.();

      if (workletUrlRef.current) {
        URL.revokeObjectURL(workletUrlRef.current);
      }
    };
  }, []);

  return {
    isCapturing,
    captureStatus,
    playbackStatus,
    startCapture,
    stopCapture,
    resetPlayback,
    metrics,
    logs,
    lastError,
    canStartTalk: !isCapturing,
    canStopTalk: isCapturing,
  };
}