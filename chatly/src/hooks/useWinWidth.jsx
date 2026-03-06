import { useEffect, useState, useCallback } from "react";

const MOBILE_WIDTH = 480;

/**
 * 锁定宽度的响应式 Hook
 * 职责：确保手机端无论如何旋转，返回的宽度永远是“窄边”尺寸。
 */
export function useWinWidth() {
  const getMetrics = useCallback(() => {
    if (typeof window === "undefined") return { width: MOBILE_WIDTH, isMobile: true };

    const rawWidth = window.innerWidth;
    const rawHeight = window.innerHeight;

    // 1. 判断是否为移动设备：取当前屏幕的最窄边
    const portraitWidth = Math.min(rawWidth, rawHeight);
    const isSmallDevice = portraitWidth <= MOBILE_WIDTH;

    // 2. 核心修正：
    // 如果是手机，width 强制返回 portraitWidth（窄边），完全无视当前的 rawWidth。
    // 如果是 PC，则返回正常的 rawWidth。
    const logicWidth = isSmallDevice ? portraitWidth : rawWidth;

    return {
      width: logicWidth,
      isMobile: isSmallDevice
    };
  }, []);

  const [metrics, setMetrics] = useState(getMetrics);

  useEffect(() => {
    let rafId;
    const update = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMetrics(getMetrics());
      });
    };

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [getMetrics]);

  return { winWidth: metrics.width, isMobile: metrics.isMobile };
}