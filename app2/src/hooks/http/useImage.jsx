import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiBase } from "./useApiBase";
import { useHttpFetch } from "./useHttpFetch";

const DEFAULT_CACHE_NAME = "image-cache";
const DEFAULT_EXPIRE_MS = 3600_000;

function buildUrl(apiBase, baseUrl, input) {
  const origin = apiBase || (typeof window !== "undefined" ? window.location.origin : "");
  const base = `${origin}${baseUrl}`.replace(/\/+$/, "");

  if (input == null || input === "") return "";
  if (typeof input === "string" && /^https?:\/\//i.test(input)) return input;

  if (typeof input === "string" || typeof input === "number") {
    return `${base}/${encodeURIComponent(String(input))}`;
  }
  if (Array.isArray(input)) {
    return `${base}/${input.map((v) => encodeURIComponent(String(v))).join("/")}`;
  }
  if (typeof input === "object") {
    const qs = new URLSearchParams(
      Object.entries(input)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return qs ? `${base}?${qs}` : base;
  }
  return base;
}

function isExpired(ts, ttl) {
  const t = Number(ts);
  return !t || Date.now() - t > ttl;
}

/**
 * useImage
 * @param {string} baseUrl 例如 "/imgs"
 * @param {any} srcOrParams 绝对URL / id / params对象 / path数组
 * @param {object} opt
 * @param {boolean} opt.enabled 默认 true
 * @param {"none"|"http"|"cacheStorage"} opt.cache 默认 "cacheStorage"
 * @param {string} opt.cacheName 默认 "image-cache"
 * @param {number} opt.expireMs 默认 1h
 * @param {string} opt.cacheKey 缓存key（签名URL会变时很有用）
 */
export function useImage(baseUrl, srcOrParams, opt = {}) {
  const { apiBase } = useApiBase();
  const { fetcher } = useHttpFetch();

  const {
    enabled = true,
    cache = "cacheStorage",
    cacheName = DEFAULT_CACHE_NAME,
    expireMs = DEFAULT_EXPIRE_MS,
    cacheKey,
  } = opt;

  const url = useMemo(() => buildUrl(apiBase, baseUrl, srcOrParams), [apiBase, baseUrl, srcOrParams]);

  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const curRef = useRef("");
  const reqIdRef = useRef(0);

  const revoke = useCallback((u) => {
    if (u) URL.revokeObjectURL(u);
  }, []);

  const clear = useCallback(() => {
    if (curRef.current) revoke(curRef.current);
    curRef.current = "";
    setSrc("");
    setError(null);
    setLoading(false);
  }, [revoke]);

  const fetchBlob = useCallback(async (u) => {
    const res = await fetcher(u, { method: "GET" }); // ✅ 不带 token
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Image fetch failed: ${res.status} ${res.statusText} | ${text.slice(0, 160)}`);
    }
    return res.blob();
  }, [fetcher]);

  const fetchBlobCacheStorage = useCallback(async (u) => {
    if (typeof caches === "undefined") return fetchBlob(u);

    const key = cacheKey || u;
    const c = await caches.open(cacheName);

    const cached = await c.match(key);
    if (cached) {
      const ts = cached.headers.get("X-Cache-Time");
      if (!isExpired(ts, expireMs)) return cached.blob();
      await c.delete(key);
    }

    const blob = await fetchBlob(u);
    await c.put(key, new Response(blob, { headers: { "X-Cache-Time": String(Date.now()) } }));
    return blob;
  }, [cacheKey, cacheName, expireMs, fetchBlob]);

  const load = useCallback(async () => {
    if (!enabled) return;
    if (!url) return clear();

    if (!/^https?:\/\//i.test(url)) {
      setSrc("");
      setError(new Error(`useImage invalid url: "${url}"`));
      return;
    }

    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const blob =
        cache === "cacheStorage" ? await fetchBlobCacheStorage(url)
          : await fetchBlob(url); // "http"/"none"：不额外做缓存

      const objUrl = URL.createObjectURL(blob);

      if (reqId !== reqIdRef.current) return revoke(objUrl);

      if (curRef.current) revoke(curRef.current);
      curRef.current = objUrl;

      setSrc(objUrl);
      setLoading(false);
    } catch (e) {
      if (reqId !== reqIdRef.current) return;
      setError(e);
      setLoading(false);
    }
  }, [enabled, url, cache, fetchBlob, fetchBlobCacheStorage, clear, revoke]);

  useEffect(() => {
    load();
    return () => {
      reqIdRef.current++;
      if (curRef.current) revoke(curRef.current);
      curRef.current = "";
    };
  }, [load, revoke]);

  const reload = useCallback(() => {
    reqIdRef.current++;
    if (curRef.current) revoke(curRef.current);
    curRef.current = "";
    setSrc("");
    return load();
  }, [load, revoke]);

  return { src, loading, error, url, reload, clear };
}