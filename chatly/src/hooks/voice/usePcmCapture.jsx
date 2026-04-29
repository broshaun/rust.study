import { useCallback, useEffect, useRef, useState } from "react";

const PROCESSOR_CODE = `
class VoiceProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs?.[0]?.[0];
    if (!input) return true;

    const int16 = new Int16Array(input.length);

    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    this.port.postMessage(int16.buffer, [int16.buffer]);
    return true;
  }
}

registerProcessor("voice-processor", VoiceProcessor);
`;

function concatInt16(a, b) {
  const out = new Int16Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
}

function createProcessorUrl() {
  return URL.createObjectURL(
    new Blob([PROCESSOR_CODE], { type: "text/javascript" })
  );
}

export function usePcmCapture({
  sampleRate = 48000,
  frameSamples = 480,
  onData,
} = {}) {
  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const nodeRef = useRef(null);
  const carryRef = useRef(new Int16Array(0));
  const onDataRef = useRef(onData);

  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState("未开始");
  const [error, setError] = useState(null);

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  const stopCapture = useCallback(async () => {
    try {
      nodeRef.current?.disconnect();
      nodeRef.current = null;

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      if (ctxRef.current && ctxRef.current.state !== "closed") {
        await ctxRef.current.close();
      }

      ctxRef.current = null;
      carryRef.current = new Int16Array(0);

      setIsCapturing(false);
      setStatus("已停止");
    } catch (e) {
      setError(e);
      setStatus("停止失败");
    }
  }, []);

  const startCapture = useCallback(async () => {
    try {
      await stopCapture();

      setError(null);
      setStatus("启动中...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: { ideal: sampleRate },
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

      const url = createProcessorUrl();
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);

      const source = ctx.createMediaStreamSource(stream);

      const node = new AudioWorkletNode(ctx, "voice-processor", {
        numberOfInputs: 1,
        numberOfOutputs: 0,
        channelCount: 1,
      });

      node.port.onmessage = (e) => {
        const raw =
          e.data instanceof ArrayBuffer
            ? new Int16Array(e.data)
            : new Int16Array(0);

        if (!raw.length) return;

        let merged = concatInt16(carryRef.current, raw);

        while (merged.length >= frameSamples) {
          const frame = merged.slice(0, frameSamples);
          merged = merged.slice(frameSamples);

          onDataRef.current?.(new Uint8Array(frame.buffer.slice(0)));
        }

        carryRef.current = merged;
      };

      source.connect(node);

      streamRef.current = stream;
      ctxRef.current = ctx;
      nodeRef.current = node;
      carryRef.current = new Int16Array(0);

      setIsCapturing(true);
      setStatus("采集中");
    } catch (e) {
      setError(e);
      setStatus("采集失败");
      await stopCapture();
    }
  }, [sampleRate, frameSamples, stopCapture]);

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return {
    isCapturing,
    status,
    error,
    startCapture,
    stopCapture,
  };
}