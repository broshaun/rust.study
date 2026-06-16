import { useMemo, useCallback } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { useApiBase, useToken } from "utils";

function replacer(key, value) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return value;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useHttpClient(baseUrl = "") {
  const { apiBase } = useApiBase();
  const { token } = useToken();

  const endpoint = useMemo(
    () => (apiBase || "") + baseUrl,
    [apiBase, baseUrl]
  );

  const request = useCallback(
    async (url, options = {}) => {
      const {
        method = "POST",
        headers = {},
        body,
        signal,
      } = options;

      const isFormData = body instanceof FormData;

      const res = await fetch(url, {
        method,
        signal,
        headers: {
          ...(token ? { Authorization: token } : {}),
          ...(!isFormData && body !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
          ...headers,
        },
        body: isFormData
          ? body
          : body === undefined
            ? undefined
            : JSON.stringify(body, replacer),
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

  const get = useCallback(
    () => request(endpoint, { method: "GET" }),
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

  const longPoll = useCallback(
    ({
      url = endpoint,
      methodName,
      payload = {},
      onMessage,
      onError,
      retryDelay = 2000,
      requestTimeout = 30000,
    }) => {
      let stopped = false;
      let controller = null;

      const run = async () => {
        while (!stopped) {
          controller = new AbortController();

          const timeoutId = setTimeout(() => {
            controller?.abort();
          }, requestTimeout);

          try {
            const data = await request(url, {
              method: "POST",
              signal: controller.signal,
              headers: methodName
                ? { "X-HTTP-Method": methodName }
                : {},
              body: payload,
            });

            if (!stopped) {
              await onMessage?.(data);
            }
          } catch (error) {
            const aborted =
              controller?.signal?.aborted ||
              error?.name === "AbortError";

            if (stopped) break;

            if (!aborted) {
              onError?.(error);
              await sleep(retryDelay);
            }
          } finally {
            clearTimeout(timeoutId);
            controller = null;
          }
        }
      };

      void run();

      return () => {
        stopped = true;
        controller?.abort();
      };
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
      longPoll,
    }),
    [
      request,
      requestBodyJson,
      getById,
      get,
      uploadFiles,
      longPoll,
    ]
  );

  return { http, endpoint };
}