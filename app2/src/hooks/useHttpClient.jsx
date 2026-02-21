import { useMemo, useCallback } from "react";
import { useLocalStorageState, useLatest } from "ahooks";
import { fetch } from "@tauri-apps/plugin-http";
import { writeFile, mkdir } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";

function replacer(key, value) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return value;
}

export function useHttpClient(baseUrl) {
  const [apiBase] = useLocalStorageState("apiBase", { defaultValue: "" });
  const [loginToken] = useLocalStorageState("zustand:login_token");
  const tokenRef = useLatest(loginToken);

  const getAuthHeaders = useCallback(() => {
    const t = tokenRef.current;
    return t ? { Authorization: t } : {};
  }, [tokenRef]);

  const requestBodyJson = useCallback(
    async (method, payload = {}) => {
      const response = await fetch(`${apiBase}${baseUrl}`, {
        method: method.toUpperCase(),
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload, replacer),
      });
      return response.json();
    },
    [apiBase, baseUrl, getAuthHeaders]
  );

  const requestParams = useCallback(
    async (method, payload = {}) => {
      const qs = new URLSearchParams(payload).toString();
      const response = await fetch(`${apiBase}${baseUrl}?${qs}`, {
        method: method.toUpperCase(),
        headers: getAuthHeaders(),
      });
      return response.json();
    },
    [apiBase, baseUrl, getAuthHeaders]
  );

  const uploadFiles = useCallback(
    async (file, method = "PUT") => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiBase}${baseUrl}`, {
        method,
        headers: getAuthHeaders(),
        body: formData,
      });
      return response.json();
    },
    [apiBase, baseUrl, getAuthHeaders]
  );

  const buildUrl = useCallback(
    (params) => {
      const origin =
        apiBase || (typeof window !== "undefined" ? window.location.origin : "");
      const base = `${origin}${baseUrl}`.replace(/\/+$/, "");

      if (params == null) return base;
      if (typeof params === "string" && /^https?:\/\//i.test(params)) return params;

      if (typeof params === "number" || typeof params === "string") {
        return `${base}/${encodeURIComponent(params)}`;
      }
      if (Array.isArray(params)) {
        return `${base}/${params.map((v) => encodeURIComponent(String(v))).join("/")}`;
      }
      if (typeof params === "object") {
        const qs = new URLSearchParams(
          Object.entries(params).filter(([, v]) => v != null)
        ).toString();
        return qs ? `${base}?${qs}` : base;
      }
      return base;
    },
    [apiBase, baseUrl]
  );

  const downFiles = useCallback(
  async (file, { dirName = "downloads" } = {}) => {
    const url = buildUrl(file);

    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      responseType: 1,
    });

    const bytes = res.data instanceof Uint8Array ? res.data : new Uint8Array(res.data);

    const cleanUrl = url.split("#")[0].split("?")[0];
    const fileName = decodeURIComponent(cleanUrl.split("/").filter(Boolean).pop() || "");
    if (!fileName) throw new Error("URL does not contain filename");

    const dir = await join(await appDataDir(), dirName);
    const savePath = await join(dir, fileName);

    await mkdir(dir, { recursive: true });   // ✅ 不再 exists，避免 allow-exists scope 问题
    await writeFile(savePath, bytes);

    return savePath;
  },
  [buildUrl, getAuthHeaders]
);

  const http = useMemo(
    () => ({ requestBodyJson, requestParams, uploadFiles, buildUrl, downFiles }),
    [requestBodyJson, requestParams, uploadFiles, buildUrl, downFiles]
  );

  return { http };
}