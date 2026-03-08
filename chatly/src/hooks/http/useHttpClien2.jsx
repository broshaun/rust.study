import { useMemo, useCallback } from "react";
import { useLatest, useLocalStorageState } from "ahooks";
import { useApiBase } from "./useApiBase";
import { useHttpFetch } from "./useHttpFetch";

/**
 * JSON 序列化转换器
 */
function replacer(key, value) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return value;
}

export function useHttpClient(baseUrl) {
  const { apiBase } = useApiBase();
  // ✅ 引入你封装的 fetcher，它已具备 Tauri 兼容性
  const { fetcher } = useHttpFetch();

  const [loginToken] = useLocalStorageState("zustand:login_token");
  const tokenRef = useLatest(loginToken);

  const endpoint = useMemo(() => {
    const origin = (apiBase || "").replace(/\/+$/, "");
    const path = (baseUrl || "").replace(/^\/+/, "");
    return origin && path ? `${origin}/${path}` : (origin || path);
  }, [apiBase, baseUrl]);

  const getAuthHeaders = useCallback(() => {
    const t = tokenRef.current;
    return t ? { Authorization: t } : {};
  }, [tokenRef]);

  /**
   * 发起 POST 请求
   * 修正：使用 fetcher 替代 fetch
   */
  const post = useCallback(
    async (methodName, payload = {}) => {
      // ✅ 使用 fetcher
      const res = await fetcher(endpoint, {
        method: 'POST', 
        headers: {
          "Content-Type": "application/json",
          "X-HTTP-Method": methodName, // 这里的 methodName 是业务指令
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload, replacer),
      });
      // 注意：如果 fetcher 内部已经处理了 json()，这里可能需要调整
      return res.json();
    },
    [endpoint, getAuthHeaders, fetcher]
  );

  /**
   * 发起 GET 请求
   */
  const getById = useCallback(
    async (id) => {
      const url = `${endpoint}?id=${id}`;
      // ✅ 使用 fetcher
      const res = await fetcher(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    [endpoint, getAuthHeaders, fetcher]
  );

  /**
   * 上传文件
   */
  const uploadFiles = useCallback(
    async (file, httpMethod = "POST") => {
      const formData = new FormData();
      formData.append("file", file);

      // ✅ 使用 fetcher
      const res = await fetcher(endpoint, {
        method: httpMethod, // 修正：允许外部指定 PUT 或 POST
        headers: getAuthHeaders(),
        body: formData,
      });
      return res.json();
    },
    [endpoint, getAuthHeaders, fetcher]
  );

  const http = useMemo(
    () => ({
      post,
      getById,
      uploadFiles
    }),
    [post, getById, uploadFiles]
  );

  return { http, endpoint };
}