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

// ✅ 关键：清理 ./ 和 ../，避免被服务器判定为可疑路径
function normalizeRelativePath(p) {
  if (!p) return "";
  // 统一斜杠
  let s = String(p).replace(/\\/g, "/");

  // 去掉开头的 "./"
  s = s.replace(/^\.\/+/, "");

  // 去掉中间的 "/./"
  s = s.replace(/\/\.\//g, "/");

  // 保险：禁止 "../"（你本来约束也不允许）
  if (/(^|\/)\.\.(\/|$)/.test(s)) return "";

  // 去掉重复斜杠
  s = s.replace(/\/{2,}/g, "/");

  return s;
}

// ✅ 关键：只编码“每一段 segment”，保留 "/" 作为路径分隔符
function encodePathPreserveSlash(path) {
  const s = normalizeRelativePath(path);
  if (!s) return "";
  return s
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

/**
 * useImage（极简约束版）
 * 约束：
 * - srcOrName 永远是 string（例如 "a.jpg" 或 "user/1.png"）
 * - 不传绝对 URL / object / array
 * - query 手动拼接（例如 "a.jpg?v=1"）⚠️（见下方说明）
 */
export function useImage(baseUrl, srcOrName, opt = {}) {
  const { apiBase } = useApiBase();
  const { fetcher } = useHttpFetch();

  const {
    enabled = true,
    cache = "cacheStorage", // "none" | "http" | "cacheStorage"
    cacheName = DEFAULT_CACHE_NAME,
    expireMs = DEFAULT_EXPIRE_MS,
    cacheKey,
  } = opt;

  // 只拼接 string：最终形态 `${apiBase}${baseUrl}/{name}`
  const url = useMemo(() => {
    if (!srcOrName) return "";

    // 保险：若误传绝对 URL，直接拒绝（按你的约束本不该发生）
    if (isHttpUrl(srcOrName)) return "";

    const base = `${apiBase || ""}${baseUrl}`.replace(/\/+$/, "");

    // ✅ 关键修复点：不要对整段 srcOrName 做 encodeURIComponent
    // 否则 "user/1.png" 会变成 "user%2F1.png"
    // 更糟糕 "./favicon.png" 会变成 ".%2Ffavicon.png" -> 很多 dev server 直接 400
    const safePath = encodePathPreserveSlash(srcOrName);
    if (!safePath) return "";

    return `${base}/${safePath}`;
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
      const res = await fetcher(u, { method: "GET" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Image fetch failed: ${res.status} ${res.statusText} | ${text.slice(0, 160)}`
        );
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
      setError(
        new Error(
          `useImage invalid name: "${srcOrName}" (absolute URL / invalid relative path is not allowed)`
        )
      );
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
          await c.put(
            key,
            new Response(blob, { headers: { "X-Cache-Time": String(Date.now()) } })
          );
        }
      } else {
        blob = await fetchBlob(url);
      }

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