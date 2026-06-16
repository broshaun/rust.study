import { useMemo, useCallback } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { useApiBase, useToken } from "utils";

/**
 * JSON 序列化转换器
 */
function replacer(key, value) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return value;
}

export function useHttpClient(baseUrl = "") {
  const { apiBase } = useApiBase();
  const { token } = useToken();

  const endpoint = useMemo(() => (apiBase || "") + baseUrl, [apiBase, baseUrl]);
  
  const request = useCallback(
    async (url, options = {}) => {
      const { method = "POST", headers = {}, body } = options;
      const isFormData = body instanceof FormData;

      //  核心修复：规范化 URL 格式
      // 防止因为末尾斜杠、双斜杠、query 参数导致 Tauri 的生产环境 Scope 匹配失败
      let normalizedUrl = url;
      try {
        // 如果传入的是相对路径，基于当前 origin 转换；如果是绝对路径，直接规范化
        const parsedUrl = new URL(url, window.location.origin);
        normalizedUrl = parsedUrl.href;
      } catch (e) {
        console.error("URL 规范化失败:", e);
      }

      // 传递给 Tauri 的是绝对规范化后的 URL
      const res = await fetch(normalizedUrl, {
        method,
        headers: {
          ...(token ? { Authorization: token } : {}),
          ...(!isFormData && body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
        body: isFormData ? body : (body === undefined ? undefined : JSON.stringify(body, replacer)),
      });

      if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
          const err = await res.json();
          message = err?.message || err?.msg || message;
        } catch { }
        throw new Error(message);
      }
      return res.json();
    },
    [token]
  );

  const requestBodyJson = useCallback(
    (methodName, payload = {}) =>
      request(endpoint, {
        headers: { "X-HTTP-Method": methodName },
        body: payload,
      }),
    [endpoint, request]
  );

  const getById = useCallback(
    (id) =>
      request(`${endpoint}?id=${encodeURIComponent(id)}`, {
        method: "GET",
      }),
    [endpoint, request]
  );

  const get = useCallback(() => {
    return request(endpoint, { method: "GET" })
  }, [endpoint, request]);

  const uploadFiles = useCallback(
    (file, method = "POST", fieldName = "file") => {
      const formData = new FormData();
      formData.append(fieldName, file);
      return request(endpoint, { method, body: formData });
    },
    [endpoint, request]
  );

  const http = useMemo(
    () => ({
      request,
      requestBodyJson,
      post: requestBodyJson,
      getById,
      get,
      uploadFiles,
    }),
    [request, requestBodyJson, getById, get, uploadFiles]
  );

  return { http, endpoint };
}