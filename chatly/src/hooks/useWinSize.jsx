import { createSignal, onMount, onCleanup } from "solid-js";

const MOBILE_WIDTH = 480;

/**
 * 响应式尺寸 Hook
 * 职责：锁定移动端宽度为窄边，并实时返回视口高度。
 */
export function useWinSize() {
  const getMetrics = () => {
    if (typeof window === "undefined") {
      return { width: MOBILE_WIDTH, height: 800, isMobile: true };
    }

    const rawWidth = window.innerWidth;
    const rawHeight = window.innerHeight;

    const portraitWidth = Math.min(rawWidth, rawHeight);
    const isSmallDevice = portraitWidth <= MOBILE_WIDTH;
    const logicWidth = isSmallDevice ? portraitWidth : rawWidth;

    return {
      width: logicWidth,
      height: rawHeight,
      isMobile: isSmallDevice,
    };
  };

  const [metrics, setMetrics] = createSignal(getMetrics());

  onMount(() => {
    let rafId = 0;

    const update = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMetrics(getMetrics());
      });
    };

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    onCleanup(() => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    });
  });

  return {
    winWidth: () => metrics().width,
    winHeight: () => metrics().height,
    isMobile: () => metrics().isMobile,
  };
}