import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiBase } from "./useApiBase";
import { fetch as fetcher } from "@tauri-apps/plugin-http";
import { db } from "hooks/db";

const CACHE_NAME = "img-hash-v1";
const fetchLock = new Map();

export function useImage(baseUrl, hashName, opt = {}) {
  const { apiBase } = useApiBase();

  const {
    enabled = true,
    useCache = false,
    maxAge = 7 * 24 * 60 * 60 * 1000,
  } = opt;

  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const srcRef = useRef("");
  const reqIdRef = useRef(0);

  const remoteUrl = useMemo(() => {
    if (!enabled || !hashName) return "";

    const origin = String(apiBase || "").replace(/\/+$/, "");
    const path = String(baseUrl || "").replace(/^\/+|\/+$/g, "");
    const file = String(hashName || "").replace(/^\/+/, "");

    if (!origin || !path || !file) return "";

    return `${origin}/${path}/${file}`;
  }, [apiBase, baseUrl, hashName, enabled]);

  const revokeObjectUrl = useCallback((url) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const touchCache = useCallback(async (url) => {
    if (!useCache || !url) return;

    try {
      await db.imageMetadata.put({
        url,
        lastAccessed: Date.now(),
      });
    } catch { }
  }, [useCache]);

  const purgeExpiredCache = useCallback(async () => {
    if (!useCache) return;

    try {
      if (typeof window === "undefined" || !window.caches) return;

      const now = Date.now();
      const expired = await db.imageMetadata
        .filter((item) => now - (item.lastAccessed || 0) > maxAge)
        .toArray();

      if (!expired.length) return;

      const cache = await caches.open(CACHE_NAME);

      await Promise.all(
        expired.map(async (item) => {
          await cache.delete(item.url);
          await db.imageMetadata.delete(item.url);
        })
      );
    } catch { }
  }, [maxAge, useCache]);

  const getBlobFromNetwork = useCallback(async (url) => {
    const res = await fetcher(url, { method: "GET" });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.blob();
  }, []);

  const getBlobFromCacheOrNetwork = useCallback(
    async (url) => {
      const canUseCache =
        useCache &&
        typeof window !== "undefined" &&
        typeof caches !== "undefined";

      if (!canUseCache) {
        return await getBlobFromNetwork(url);
      }

      const cache = await caches.open(CACHE_NAME);
      let cached = await cache.match(url);

      if (!cached) {
        if (!fetchLock.has(url)) {
          const task = (async () => {
            const res = await fetcher(url, { method: "GET" });

            if (!res.ok) {
              throw new Error(`HTTP ${res.status}`);
            }

            await cache.put(url, res.clone());
            return res;
          })().finally(() => {
            fetchLock.delete(url);
          });

          fetchLock.set(url, task);
        }

        const res = await fetchLock.get(url);
        cached = res.clone();
      } else {
        cached = cached.clone();
      }

      await touchCache(url);
      return await cached.blob();
    },
    [useCache, getBlobFromNetwork, touchCache]
  );

  const updateObjectUrl = useCallback(
    (nextSrc) => {
      const oldSrc = srcRef.current;

      srcRef.current = nextSrc;
      setSrc(nextSrc);

      if (oldSrc && oldSrc !== nextSrc) {
        revokeObjectUrl(oldSrc);
      }
    },
    [revokeObjectUrl]
  );

  const load = useCallback(async () => {
    if (!remoteUrl) return;

    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const blob = await getBlobFromCacheOrNetwork(remoteUrl);

      if (reqId !== reqIdRef.current) return;

      const nextSrc = URL.createObjectURL(blob);
      updateObjectUrl(nextSrc);
      setLoading(false);
    } catch (e) {
      if (reqId !== reqIdRef.current) return;

      setError(e);
      setLoading(false);
      setSrc("");
    }
  }, [remoteUrl, getBlobFromCacheOrNetwork, updateObjectUrl]);

  useEffect(() => {
    purgeExpiredCache();
  }, [purgeExpiredCache]);

  useEffect(() => {
    if (!remoteUrl) {
      setSrc("");
      setLoading(false);
      setError(null);
      return;
    }

    load();

    return () => {
      reqIdRef.current += 1;
    };
  }, [remoteUrl, load]);

  useEffect(() => {
    return () => {
      revokeObjectUrl(srcRef.current);
    };
  }, [revokeObjectUrl]);

  return {
    src,
    avatarSrc: src,
    loading,
    error,
    reload: load,
  };
}