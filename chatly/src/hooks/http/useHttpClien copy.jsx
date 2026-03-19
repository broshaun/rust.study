import { useMemo, useCallback } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { useApiBase } from "./useApiBase";
import { useToken } from "hooks";

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

  

  const endpoint = useMemo(() => {
    const origin = String(apiBase || "").replace(/\/+$/, "");
    const path = String(baseUrl || "").replace(/^\/+/, "");
    return origin && path ? `${origin}/${path}` : origin || path;
  }, [apiBase, baseUrl]);

  const request = useCallback(
    async (url, options = {}) => {
      const { method = "POST", headers = {}, body } = options;
      const isFormData = body instanceof FormData;

      const res = await fetch(url, {
        method,
        headers: {
          ...(token ? { Authorization: token } : {}),
          ...(isFormData || body === undefined
            ? {}
            : { "Content-Type": "application/json" }),
          ...headers,
        },
        body:
          body === undefined
            ? undefined
            : isFormData
              ? body
              : JSON.stringify(body, replacer),
      });

      if (!res.ok) {
        let message = `HTTP ${res.status}`;

        try {
          const err = await res.clone().json();
          message = err?.message || err?.msg || message;
        } catch {}

        throw new Error(message);
      }

      return res.json();
    },
    [token]
  );

  const requestBodyJson = useCallback(
    (methodName, payload = {}) =>
      request(endpoint, {
        method: "POST",
        headers: {
          "X-HTTP-Method": methodName,
        },
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

  const uploadFiles = useCallback(
    (file, method = "POST", fieldName = "file") => {
      const formData = new FormData();
      formData.append(fieldName, file);

      return request(endpoint, {
        method,
        body: formData,
      });
    },
    [endpoint, request]
  );

  const http = useMemo(
    () => ({
      request,
      requestBodyJson,
      post: requestBodyJson,
      getById,
      uploadFiles,
    }),
    [request, requestBodyJson, getById, uploadFiles]
  );

  return {
    http,
    endpoint,
  };
}