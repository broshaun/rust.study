import { useCallback } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

/**
 * 环境检查工具
 * 确保在非浏览器环境下（如 SSR）不会崩溃
 */
const getFetchImplementation = () => {
  if (typeof window === "undefined") return null;
  // 优先判断是否在 Tauri 环境中运行
  return isTauri() ? tauriFetch : window.fetch.bind(window);
};

export function useHttpFetch() {
  /**
   * 核心请求函数
   * @param {string} url - 请求地址
   * @param {Object} options - 配置项（method, headers, body 等）
   */
  const fetcher = useCallback(async (url, options = {}) => {
    const impl = getFetchImplementation();
    
    if (!impl) {
      throw new Error("Fetch implementation is not available in this environment.");
    }

    try {
      // 执行请求
      const response = await impl(url, options);

      // 自动处理 HTTP 错误状态（如 404, 500）
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error; // 将错误抛出给调用者处理
    }
  }, []);

  return { fetcher };
}