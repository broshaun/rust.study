import { useCallback, useEffect, useRef, useState } from "react";
import { Channel, invoke } from "@tauri-apps/api/core";

export function useAudioTransport() {
  const channelRef = useRef(null);
  const sessionIdRef = useRef(null);
  const listenersRef = useRef(new Set());

  const [sessionId, setSessionId] = useState(null);
  const [transportStatus, setTransportStatus] = useState("idle");
  const [lastError, setLastError] = useState(null);

  const notifyListeners = useCallback((message) => {
    listenersRef.current.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error("audio transport listener error:", error);
      }
    });
  }, []);

  const subscribe = useCallback((listener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const openTransport = useCallback(async () => {
    try {
      if (channelRef.current && sessionIdRef.current) {
        return sessionIdRef.current;
      }

      setTransportStatus("opening");
      setLastError(null);

      const downlink = new Channel();
      downlink.onmessage = (message) => {
        notifyListeners(message);
      };

      const newSessionId = await invoke("open_audio_transport", {
        downlink,
      });

      channelRef.current = downlink;
      sessionIdRef.current = newSessionId;
      setSessionId(newSessionId);
      setTransportStatus("open");

      return newSessionId;
    } catch (error) {
      console.error("openTransport failed:", error);
      setLastError(error);
      setTransportStatus("error");
      throw error;
    }
  }, [notifyListeners]);

  const sendAudio = useCallback(async (payload) => {
    try {
      const currentSessionId = sessionIdRef.current;

      if (!currentSessionId) {
        throw new Error("audio transport is not open");
      }

      await invoke("push_audio_uplink", {
        sessionId: currentSessionId,
        payload: Array.from(payload),
      });

      setTransportStatus("sending");
      setLastError(null);
    } catch (error) {
      console.error("sendAudio failed:", error);
      setLastError(error);
      setTransportStatus("error");
      throw error;
    }
  }, []);

  const closeTransport = useCallback(async () => {
    const currentSessionId = sessionIdRef.current;

    try {
      if (currentSessionId) {
        await invoke("close_audio_transport", {
          sessionId: currentSessionId,
        });
      }
    } catch (error) {
      console.error("closeTransport failed:", error);
      setLastError(error);
    } finally {
      channelRef.current = null;
      sessionIdRef.current = null;
      setSessionId(null);
      setTransportStatus("closed");
      listenersRef.current.clear();
    }
  }, []);

  useEffect(() => {
    return () => {
      const currentSessionId = sessionIdRef.current;
      if (currentSessionId) {
        invoke("close_audio_transport", { sessionId: currentSessionId }).catch(() => {});
      }
    };
  }, []);

  return {
    sessionId,
    transportStatus,
    lastError,
    openTransport,
    sendAudio,
    closeTransport,
    subscribe,
  };
}