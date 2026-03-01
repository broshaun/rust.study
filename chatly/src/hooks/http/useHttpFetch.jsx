import { useCallback } from "react";
import { isTauri } from "@tauri-apps/api/core";

const IS_TAURI = isTauri();

let tauriFetchPromise = null;

/**
 * 获取最终 fetch 实现
 * - Web: 原生 fetch
 * - Tauri: plugin-http fetch（懒加载 + 单例缓存）
 */
async function resolveFetch() {
  if (!IS_TAURI) {
    return window.fetch.bind(window);
  }

  if (!tauriFetchPromise) {
    tauriFetchPromise = import("@tauri-apps/plugin-http")
      .then((mod) => mod.fetch)
      .catch((err) => {
        tauriFetchPromise = null;
        throw err;
      });
  }

  return tauriFetchPromise;
}

export function useHttpFetch() {
  const fetcher = useCallback(async (url, options = {}) => {
    const fetchImpl = await resolveFetch();
    return fetchImpl(url, options);
  }, []);

  return { fetcher };
}