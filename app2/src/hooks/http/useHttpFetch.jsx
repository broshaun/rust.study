import { useCallback } from "react";
import { isTauri } from "@tauri-apps/api/core";

/**
 * 只在模块初始化时判断一次运行环境
 * - Tauri: 使用 plugin-http fetch（通过 dynamic import 懒加载）
 * - Web: 使用 window.fetch
 */
const IS_TAURI = isTauri();

/**
 * 缓存 tauri fetch 的加载 Promise，确保只 import 一次
 * - Web 环境永远不会触发 import
 */
let tauriFetchPromise = null;

/** 获取最终应使用的 fetch 实现（Tauri 环境只加载一次） */
async function getFetchImpl() {
  if (!IS_TAURI) return fetch;

  if (!tauriFetchPromise) {
    tauriFetchPromise = import("@tauri-apps/plugin-http").then((m) => m.fetch);
  }
  return tauriFetchPromise;
}

/**
 * useHttpFetch
 * - 对外只暴露 fetcher
 * - 环境判断 + plugin import 都只发生一次（在启动阶段/首次使用阶段）
 */
export function useHttpFetch() {
  const fetcher = useCallback(async (url, options = {}) => {
    const f = await getFetchImpl();
    return f(url, options);
  }, []);

  return { fetcher };
}