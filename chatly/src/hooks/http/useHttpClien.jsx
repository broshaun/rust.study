import { useMemo, useCallback } from "react";
import { fetch as fetcher } from "@tauri-apps/plugin-http";
import { useApiBase } from "./useApiBase";
import { getAuthHeader } from "hooks/store";

export function useHttpClient(baseUrl) {
  const { apiBase } = useApiBase();

  const endpoint = useMemo(
    () => `${apiBase || ""}${baseUrl || ""}`,
    [apiBase, baseUrl]
  );

  const request = useCallback(async (url, options = {}) => {
    const { method = "POST", headers = {}, body } = options;
    const authHeader = (await getAuthHeader()) || {};
    const isFormData = body instanceof FormData;

    const res = await fetcher(url, {
      method,
      headers: {
        ...authHeader,
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
          : JSON.stringify(body),
    });

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const err = await res.clone().json();
        message = err?.message || message;
      } catch {}
      throw new Error(message);
    }

    return res.json();
  }, []);

  const post = useCallback(
    (methodName, payload = {}) =>
      request(endpoint, {
        method: "POST",
        headers: { "X-HTTP-Method": methodName },
        body: payload,
      }),
    [endpoint, request]
  );

  const getById = useCallback(
    (id) => request(`${endpoint}?id=${encodeURIComponent(id)}`, { method: "GET" }),
    [endpoint, request]
  );

  const uploadFiles = useCallback(
    (file, method = "POST") => {
      const formData = new FormData();
      formData.append("file", file);
      return request(endpoint, { method, body: formData });
    },
    [endpoint, request]
  );

  const http = useMemo(
    () => ({
      post,
      requestBodyJson: post,
      getById,
      uploadFiles,
    }),
    [post, getById, uploadFiles]
  );

  return { http, endpoint };
}