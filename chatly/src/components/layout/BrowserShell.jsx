import { useEffect, useRef } from "react";
import styles from "./BrowserShell.module.css";

function isIOS() {
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // iPhone/iPad/iPod
  const iOSDevice = /iPhone|iPad|iPod/i.test(ua);

  // iPadOS（MacIntel + 触控点）
  const iPadOS = platform === "MacIntel" && maxTouchPoints > 1;

  return iOSDevice || iPadOS;
}

export default function BrowserShell({ children }) {
  const baseHRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    // ✅ 只在 iOS 才启用 safe-area，其他平台强制 0
    const ios = isIOS();
    const root = document.documentElement;

    if (ios) {
      root.style.setProperty("--sat", "env(safe-area-inset-top, 0px)");
      root.style.setProperty("--sab", "env(safe-area-inset-bottom, 0px)");
      root.style.setProperty("--sal", "env(safe-area-inset-left, 0px)");
      root.style.setProperty("--sar", "env(safe-area-inset-right, 0px)");
    } else {
      root.style.setProperty("--sat", "0px");
      root.style.setProperty("--sab", "0px");
      root.style.setProperty("--sal", "0px");
      root.style.setProperty("--sar", "0px");
    }

    const update = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const vv = window.visualViewport;
        const h = (vv && vv.height) || window.innerHeight;

        // 用最大高度作为未弹键盘基准，计算键盘高度
        baseHRef.current = Math.max(baseHRef.current || 0, h);
        const kb = Math.max(0, baseHRef.current - h);

        root.style.setProperty("--vh", `${h * 0.01}px`);
        root.style.setProperty("--kb", `${kb}px`);
        root.classList.toggle("keyboard-open", kb > 120);
      });
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", update);
      vv.addEventListener("scroll", update);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      if (vv) {
        vv.removeEventListener("resize", update);
        vv.removeEventListener("scroll", update);
      }
    };
  }, []);

  return <div className={styles.root}>{children}</div>;
}