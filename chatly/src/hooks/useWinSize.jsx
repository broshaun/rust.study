import { useEffect, useState, useCallback } from "react";

const MOBILE_WIDTH = 480;

/**
 * 响应式尺寸 Hook
 * 职责：锁定移动端宽度为窄边，并实时返回视口高度。
 */
export function useWinSize() {
  const getMetrics = useCallback(() => {
    if (typeof window === "undefined") {
      return { width: MOBILE_WIDTH, height: 800, isMobile: true };
    }

    const rawWidth = window.innerWidth;
    const rawHeight = window.innerHeight;

    // 1. 判断是否为移动设备：取当前屏幕的最窄边
    const portraitWidth = Math.min(rawWidth, rawHeight);
    const isSmallDevice = portraitWidth <= MOBILE_WIDTH;

    // 2. 宽度逻辑：手机端强制返回窄边，PC端返回真实宽度
    const logicWidth = isSmallDevice ? portraitWidth : rawWidth;

    return {
      width: logicWidth,
      height: rawHeight, // 高度通常返回真实视口高度，以便适配键盘弹出
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

  return { 
    winWidth: metrics.width, 
    winHeight: metrics.height, 
    isMobile: metrics.isMobile 
  };
}