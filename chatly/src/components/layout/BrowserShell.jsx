import { useEffect, useRef } from "react";
import styles from "./BrowserShell.module.css";

function isIOSDevice() {
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isIpadOS = navigator.maxTouchPoints > 1 && /Mac/.test(ua);
  return isIOS || isIpadOS;
}

function getIOSSafeArea() {
  if (!isIOSDevice()) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const screenHeight = window.screen.height || 0;
  const screenWidth = window.screen.width || 0;
  const windowHeight = window.innerHeight || 0;
  const windowWidth = window.innerWidth || 0;

  const isPortrait = screenHeight > screenWidth;
  const safeArea = { top: 0, right: 0, bottom: 0, left: 0 };

  if (isPortrait) {
    if (screenHeight > windowHeight + 20) {
      safeArea.top = 44;
      safeArea.bottom = 34;
    }
  } else {
    if (screenWidth > windowWidth + 20) {
      safeArea.left = 44;
      safeArea.right = 44;
      safeArea.bottom = 21;
    }
  }

  const devicePixelRatio = window.devicePixelRatio || 1;
  const screenDiagonal =
    Math.hypot(screenWidth, screenHeight) / devicePixelRatio;

  if (screenDiagonal > 6.6) {
    safeArea.top = Math.max(safeArea.top, 47);
  }

  return safeArea;
}

function setSafeAreaVars(safeArea) {
  const root = document.documentElement;
  root.style.setProperty("--safe-area-top", `${safeArea.top}px`);
  root.style.setProperty("--safe-area-right", `${safeArea.right}px`);
  root.style.setProperty("--safe-area-bottom", `${safeArea.bottom}px`);
  root.style.setProperty("--safe-area-left", `${safeArea.left}px`);
}

export default function BrowserShell({ children }) {
  const prevSafeAreaRef = useRef({
    top: -1,
    right: -1,
    bottom: -1,
    left: -1,
  });

  useEffect(() => {
    let rafId = 0;

    const updateSafeArea = () => {
      const nextSafeArea = getIOSSafeArea();
      const prevSafeArea = prevSafeAreaRef.current;

      const changed =
        prevSafeArea.top !== nextSafeArea.top ||
        prevSafeArea.right !== nextSafeArea.right ||
        prevSafeArea.bottom !== nextSafeArea.bottom ||
        prevSafeArea.left !== nextSafeArea.left;

      if (!changed) return;

      setSafeAreaVars(nextSafeArea);
      prevSafeAreaRef.current = nextSafeArea;
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateSafeArea);
    };

    scheduleUpdate();

    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("orientationchange", scheduleUpdate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("orientationchange", scheduleUpdate);
    };
  }, []);

  return <div className={styles.root}>{children}</div>;
}