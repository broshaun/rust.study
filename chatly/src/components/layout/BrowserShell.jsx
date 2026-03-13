import { useEffect, useRef } from "react";
import styles from "./BrowserShell.module.css";

function isIOSDevice() {
  const ua = navigator.userAgent || "";
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function getIOSSafeArea() {
  const safeArea = { top: 0, bottom: 0, left: 0, right: 0 };

  if (!isIOSDevice()) return safeArea;

  const screenHeight = window.screen.height;
  const screenWidth = window.screen.width;
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;

  const isPortrait = screenHeight > screenWidth;

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
    safeArea.top = 47;
  }

  return safeArea;
}

function applySafeAreaVars(nextSafeArea, prevSafeAreaRef) {
  const prev = prevSafeAreaRef.current;

  if (
    prev.top === nextSafeArea.top &&
    prev.bottom === nextSafeArea.bottom &&
    prev.left === nextSafeArea.left &&
    prev.right === nextSafeArea.right
  ) {
    return;
  }

  const root = document.documentElement;

  root.style.setProperty("--safe-area-top", `${nextSafeArea.top}px`);
  root.style.setProperty("--safe-area-bottom", `${nextSafeArea.bottom}px`);
  root.style.setProperty("--safe-area-left", `${nextSafeArea.left}px`);
  root.style.setProperty("--safe-area-right", `${nextSafeArea.right}px`);

  prevSafeAreaRef.current = nextSafeArea;
}

export default function BrowserShell({ children }) {
  const prevSafeAreaRef = useRef({
    top: -1,
    bottom: -1,
    left: -1,
    right: -1,
  });

  useEffect(() => {
    let rafId = 0;

    const updateSafeArea = () => {
      const nextSafeArea = getIOSSafeArea();
      applySafeAreaVars(nextSafeArea, prevSafeAreaRef);
    };

    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateSafeArea);
    };

    updateSafeArea();

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, {
      passive: true,
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return <div className={styles.root}>{children}</div>;
}