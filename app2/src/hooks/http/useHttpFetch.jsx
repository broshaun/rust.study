import { useCallback } from "react";
import { isTauri } from "@tauri-apps/api/core";

/**
 * 全局 fetch（统一入口）
 * - Tauri: 自动使用 @tauri-apps/plugin-http 的 fetch
 * - Web: 自动使用 window.fetch
 * - 不对外暴露任何 tauri/useTauriFetch 参数
 */
export function useHttpFetch() {
  const fetcher = useCallback(async (url, options = {}) => {
    // isTauri() 是同步判断，可直接用
    if (isTauri()) {
      const { fetch } = await import("@tauri-apps/plugin-http");
      return fetch(url, options);
    }
    return fetch(url, options);
  }, []);

  return { fetcher };
}