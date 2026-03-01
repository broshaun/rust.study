import { useMemo, useCallback } from "react";
import { useLatest, useLocalStorageState } from "ahooks";
import { useApiBase } from "./useApiBase";
import { useHttpFetch } from "./useHttpFetch";

function replacer(key, value) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return value;
}

export function useHttpClient(baseUrl) {
  const { apiBase } = useApiBase();
  const { fetcher } = useHttpFetch();

  const [loginToken] = useLocalStorageState("zustand:login_token");
  const tokenRef = useLatest(loginToken);

  const getAuthHeaders = useCallback(() => {
    const t = tokenRef.current;
    return t ? { Authorization: t } : {};
  }, [tokenRef]);

  const requestBodyJson = useCallback(
    async (method, payload = {}) => {
      const res = await fetcher(`${apiBase}${baseUrl}`, {
        method: method.toUpperCase(),
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload, replacer),
      });
      return res.json();
    },
    [apiBase, baseUrl, fetcher, getAuthHeaders]
  );

  const requestParams = useCallback(
    async (method, payload = {}) => {
      const qs = new URLSearchParams(
        Object.entries(payload)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      ).toString();

      const url = qs ? `${apiBase}${baseUrl}?${qs}` : `${apiBase}${baseUrl}`;

      const res = await fetcher(url, {
        method: method.toUpperCase(),
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    [apiBase, baseUrl, fetcher, getAuthHeaders]
  );

  const uploadFiles = useCallback(
    async (file, method = "PUT") => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetcher(`${apiBase}${baseUrl}`, {
        method,
        headers: getAuthHeaders(),
        body: formData,
      });
      return res.json();
    },
    [apiBase, baseUrl, fetcher, getAuthHeaders]
  );

  const buildUrl = useCallback(
    (params) => {
      const origin = apiBase || (typeof window !== "undefined" ? window.location.origin : "");
      const base = `${origin}${baseUrl}`.replace(/\/+$/, "");

      if (params == null) return base;
      if (typeof params === "string" && /^https?:\/\//i.test(params)) return params;

      if (typeof params === "number" || typeof params === "string") {
        return `${base}/${encodeURIComponent(String(params))}`;
      }

      if (Array.isArray(params)) {
        return `${base}/${params.map((v) => encodeURIComponent(String(v))).join("/")}`;
      }

      if (typeof params === "object") {
        const qs = new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)])
        ).toString();
        return qs ? `${base}?${qs}` : base;
      }

      return base;
    },
    [apiBase, baseUrl]
  );

  const http = useMemo(
    () => ({ requestBodyJson, requestParams, uploadFiles, buildUrl }),
    [requestBodyJson, requestParams, uploadFiles, buildUrl]
  );

  return { http };
}