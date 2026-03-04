import { useEffect } from "react";
import styles from "./BrowserShell.module.css";

export default function BrowserShell({ children }) {
  // 核心：纯JS计算iOS安全区尺寸（不依赖viewport-fit=cover）
  const getIOSSafeArea = () => {
    // 默认安全区全为0
    const safeArea = { top: 0, bottom: 0, left: 0, right: 0 };

    // 第一步：判断是否是iOS设备
    const isIOS = () => {
      const ua = navigator.userAgent || "";
      return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    };

    if (!isIOS()) return safeArea;

    // 第二步：获取屏幕/窗口尺寸
    const screenHeight = window.screen.height;
    const screenWidth = window.screen.width;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // 第三步：判断是否是竖屏
    const isPortrait = screenHeight > screenWidth;

    // 第四步：计算安全区（适配主流iOS设备）
    // 竖屏 - 刘海屏/灵动岛设备（顶部44px，底部34px）
    if (isPortrait) {
      // 屏幕高度 > 窗口高度 → 有刘海/灵动岛
      if (screenHeight > windowHeight + 20) {
        safeArea.top = 44; // 刘海/灵动岛高度（通用值）
        safeArea.bottom = 34; // 底部小黑条高度（通用值）
      }
    } else {
      // 横屏 - 刘海屏设备（左右各44px）
      if (screenWidth > windowWidth + 20) {
        safeArea.left = 44;
        safeArea.right = 44;
        safeArea.bottom = 21; // 横屏底部小黑条
      }
    }

    // 特殊设备适配（可选，根据需要加）
    const devicePixelRatio = window.devicePixelRatio;
    const screenDiagonal = Math.hypot(screenWidth, screenHeight) / devicePixelRatio;
    // iPhone 14/15 Pro Max（灵动岛，顶部47px）
    if (screenDiagonal > 6.6) {
      safeArea.top = 47;
    }

    return safeArea;
  };

  // 同步安全区到CSS变量
  useEffect(() => {
    const safeArea = getIOSSafeArea();
    const root = document.documentElement;
    // 同步到全局CSS变量（非iOS全为0）
    root.style.setProperty("--safe-area-top", `${safeArea.top}px`);
    root.style.setProperty("--safe-area-bottom", `${safeArea.bottom}px`);
    root.style.setProperty("--safe-area-left", `${safeArea.left}px`);
    root.style.setProperty("--safe-area-right", `${safeArea.right}px`);

    // 横竖屏切换时重新计算
    const handleResize = () => {
      const newSafeArea = getIOSSafeArea();
      root.style.setProperty("--safe-area-top", `${newSafeArea.top}px`);
      root.style.setProperty("--safe-area-bottom", `${newSafeArea.bottom}px`);
      root.style.setProperty("--safe-area-left", `${newSafeArea.left}px`);
      root.style.setProperty("--safe-area-right", `${newSafeArea.right}px`);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // 根容器：仅加安全区内边距，不影响原有布局
  return <div className={styles.root}>{children}</div>;
}