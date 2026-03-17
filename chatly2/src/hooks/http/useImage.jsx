import { useMemo } from "react";
import { useApiBase } from "./useApiBase";

/**
 * 极简图片路径 Hook
 * @param {string} filename - 文件名/哈希
 * @param {string} baseUrl - 基础目录，默认 /imgs
 * @returns {object} { src }
 */
export function useImage(filename, baseUrl = "/imgs") {
  const { apiBase } = useApiBase();

  const src = useMemo(() => {
    // 依然保持裸奔拼接，逻辑极其精简
    // 假设 apiBase="http://xxx", baseUrl="/imgs", filename="/abc.png"
    return filename ? `${apiBase}${baseUrl}/${filename}` : "";
  }, [filename, baseUrl, apiBase]);

  return { src };
}