import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiBase } from "./useApiBase";
import { useHttpFetch } from "./useHttpFetch";

const DEFAULT_CACHE_NAME = "image-cache";
const DEFAULT_EXPIRE_MS = 3600_000;

const isHttpUrl = (s) => /^https?:\/\//i.test(s);
const expired = (ts, ttl) => {
  const t = Number(ts);
  return !t || Date.now() - t > ttl;
};

/**
 * useImage（极简约束版）
 * 约束：
 * - srcOrName 永远是 string（例如 "a.jpg" 或 "user/1.png"）
 * - 不传绝对 URL / object / array
 * - query 手动拼接（例如 "a.jpg?v=1"）
 */
export function useImage(baseUrl, srcOrName, opt = {}) {
  const { apiBase } = useApiBase();
  const { fetcher } = useHttpFetch();

  const {
    enabled = true,
    cache = "cacheStorage", // "none" | "http" | "cacheStorage"
    cacheName = DEFAULT_CACHE_NAME,
    expireMs = DEFAULT_EXPIRE_MS,
    cacheKey, // 可选：自定义缓存 key（一般不需要）
  } = opt;

  // 只拼接 string：最终形态 `${apiBase}${baseUrl}/{name}`
  const url = useMemo(() => {
    if (!srcOrName) return "";
    // 保险：若误传绝对 URL，直接报错（按你的约束本不该发生）
    if (isHttpUrl(srcOrName)) return "";
    const base = `${apiBase || ""}${baseUrl}`.replace(/\/+$/, "");
    return `${base}/${encodeURIComponent(srcOrName)}`; // 文件名编码，避免空格等问题
  }, [apiBase, baseUrl, srcOrName]);

  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const curRef = useRef("");
  const reqIdRef = useRef(0);

  const revoke = useCallback((u) => u && URL.revokeObjectURL(u), []);

  const clear = useCallback(() => {
    if (curRef.current) revoke(curRef.current);
    curRef.current = "";
    setSrc("");
    setError(null);
    setLoading(false);
  }, [revoke]);

  const fetchBlob = useCallback(
    async (u) => {
      const res = await fetcher(u, { method: "GET" }); // 不带 token
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Image fetch failed: ${res.status} ${res.statusText} | ${text.slice(0, 160)}`);
      }
      return res.blob();
    },
    [fetcher]
  );

  const load = useCallback(async () => {
    if (!enabled) return;
    if (!srcOrName) return clear();
    if (!url) {
      setSrc("");
      setError(new Error(`useImage invalid name: "${srcOrName}" (absolute URL is not allowed)`));
      return;
    }

    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);

    try {
      let blob;

      if (cache === "cacheStorage" && typeof caches !== "undefined") {
        const key = cacheKey || url;
        const c = await caches.open(cacheName);

        const hit = await c.match(key);
        if (hit) {
          const ts = hit.headers.get("X-Cache-Time");
          if (!expired(ts, expireMs)) {
            blob = await hit.blob();
          } else {
            await c.delete(key);
          }
        }

        if (!blob) {
          blob = await fetchBlob(url);
          await c.put(key, new Response(blob, { headers: { "X-Cache-Time": String(Date.now()) } }));
        }
      } else {
        // "http" / "none"：不额外缓存（是否命中 HTTP 缓存由环境决定）
        blob = await fetchBlob(url);
      }

      const objUrl = URL.createObjectURL(blob);

      // 竞态：非最新请求则释放
      if (reqId !== reqIdRef.current) return revoke(objUrl);

      // 替换：释放旧 objectURL
      if (curRef.current) revoke(curRef.current);
      curRef.current = objUrl;

      setSrc(objUrl);
      setLoading(false);
    } catch (e) {
      if (reqId !== reqIdRef.current) return;
      setError(e);
      setLoading(false);
    }
  }, [enabled, srcOrName, url, cache, cacheName, cacheKey, expireMs, fetchBlob, clear, revoke]);

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