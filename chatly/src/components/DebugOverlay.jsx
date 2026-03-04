import { useEffect, useState } from "react";

export default function DebugOverlay() {
  const [info, setInfo] = useState({});

  useEffect(() => {
    const update = () => {
      setInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        userAgent: navigator.userAgent,
        url: location.href,
        viewport: document.querySelector("meta[name=viewport]")?.content,
      });
    };

    update();

    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 999999,
      background: "rgba(0,0,0,0)",
      color: "#0f0",
      fontSize: 12,
      padding: 10,
      maxWidth: "100vw",
      wordBreak: "break-all",
      pointerEvents: "none"
    }}>
      <pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
}