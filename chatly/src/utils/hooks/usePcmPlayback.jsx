import { useCallback, useRef, useState } from "react";

function concatUint8(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
}

export function usePcmPlayback({
  sampleRate = 48000,
  frameSamples = 480,
  minBufferFrames = 2,
  maxBufferFrames = 12,
  defaultPlaying = false,
} = {}) {
  const frameBytes = frameSamples * 2;

  const ctxRef = useRef(null);
  const pendingRef = useRef(new Uint8Array(0));
  const queueRef = useRef([]);
  const nextTimeRef = useRef(0);
  const drainingRef = useRef(false);
  const enabledRef = useRef(defaultPlaying);

  const [isPlayingEnabled, setIsPlayingEnabled] = useState(defaultPlaying);
  const [status, setStatus] = useState(defaultPlaying ? "等待音频" : "已停止");
  const [error, setError] = useState(null);

  const getContext = useCallback(async () => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext({
        sampleRate,
        latencyHint: "interactive",
      });
    }

    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }

    return ctxRef.current;
  }, [sampleRate]);

  const playQueued = useCallback(async () => {
    if (!enabledRef.current) return;
    if (drainingRef.current) return;
    if (queueRef.current.length < minBufferFrames) return;

    drainingRef.current = true;

    try {
      const ctx = await getContext();
      setStatus("播放中");

      while (enabledRef.current && queueRef.current.length > 0) {
        const bytes = queueRef.current.shift();

        const int16 = new Int16Array(
          bytes.buffer,
          bytes.byteOffset,
          bytes.byteLength / 2
        );

        const float32 = new Float32Array(int16.length);

        for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / 0x8000;
        }

        const buffer = ctx.createBuffer(1, float32.length, sampleRate);
        buffer.copyToChannel(float32, 0);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        const now = ctx.currentTime;

        if (
          nextTimeRef.current === 0 ||
          nextTimeRef.current < now ||
          nextTimeRef.current - now > 0.15
        ) {
          nextTimeRef.current = now + 0.02;
        }

        source.start(nextTimeRef.current);
        nextTimeRef.current += buffer.duration;
      }

      if (enabledRef.current) {
        setStatus("等待音频");
      }
    } catch (e) {
      setError(e);
      setStatus("播放失败");
    } finally {
      drainingRef.current = false;
    }
  }, [getContext, minBufferFrames, sampleRate]);

  const pushBytes = useCallback(
    (chunk) => {
      const bytes =
        chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);

      if (!bytes.length) return;

      // 未开启播放时，数据接收但直接丢弃
      if (!enabledRef.current) return;

      let pending = concatUint8(pendingRef.current, bytes);

      while (pending.length >= frameBytes) {
        queueRef.current.push(pending.slice(0, frameBytes));
        pending = pending.slice(frameBytes);
      }

      pendingRef.current = pending;

      if (queueRef.current.length > maxBufferFrames) {
        queueRef.current.splice(
          0,
          queueRef.current.length - maxBufferFrames
        );
        nextTimeRef.current = 0;
      }

      playQueued();
    },
    [frameBytes, maxBufferFrames, playQueued]
  );

  const start = useCallback(() => {
    enabledRef.current = true;
    setIsPlayingEnabled(true);
    setError(null);
    setStatus("等待音频");
  }, []);

  const stop = useCallback(async () => {
    enabledRef.current = false;
    drainingRef.current = false;

    pendingRef.current = new Uint8Array(0);
    queueRef.current = [];
    nextTimeRef.current = 0;

    if (ctxRef.current && ctxRef.current.state !== "closed") {
      await ctxRef.current.close();
    }

    ctxRef.current = null;

    setIsPlayingEnabled(false);
    setStatus("已停止");
  }, []);

  return {
    isPlayingEnabled,
    status,
    error,
    pushBytes,
    start,
    stop,
  };
}