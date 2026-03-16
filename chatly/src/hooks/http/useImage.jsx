import { createSignal, createMemo, createEffect, onCleanup } from "solid-js";
import { useApiBase } from "./useApiBase";
import { fetch as fetcher } from "@tauri-apps/plugin-http";
import { db } from "@/hooks/db";

const CACHE_NAME = "img-hash-v1";
const fetchLock = new Map();

export function useImage(baseUrl, hashName, opt = {}) {
  const { apiBase } = useApiBase();

  const enabled = opt.enabled ?? true;
  const useCache = opt.useCache ?? false;
  const maxAge = opt.maxAge ?? 7 * 24 * 60 * 60 * 1000;

  const [src, setSrc] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);

  let currentSrc = "";
  let reqId = 0;

  const remoteUrl = createMemo(() => {
    if (!enabled || !hashName) return "";

    const origin = String(apiBase() || "").replace(/\/+$/, "");
    const path = String(baseUrl || "").replace(/^\/+|\/+$/g, "");
    const file = String(hashName || "").replace(/^\/+/, "");

    if (!origin || !path || !file) return "";

    return `${origin}/${path}/${file}`;
  });

  const revokeObjectUrl = (url) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  const touchCache = (url) => {
    if (!useCache || !url) return Promise.resolve();

    return db.imageMetadata
      .put({
        url,
        lastAccessed: Date.now(),
      })
      .catch(() => {});
  };

  const purgeExpiredCache = () => {
    if (!useCache) return Promise.resolve();
    if (typeof window === "undefined" || !window.caches) return Promise.resolve();

    const now = Date.now();

    return db.imageMetadata
      .filter((item) => now - (item.lastAccessed || 0) > maxAge)
      .toArray()
      .then((expired) => {
        if (!expired.length) return;

        return caches.open(CACHE_NAME).then((cache) =>
          Promise.all(
            expired.map((item) =>
              cache
                .delete(item.url)
                .then(() => db.imageMetadata.delete(item.url))
                .catch(() => {})
            )
          )
        );
      })
      .catch(() => {});
  };

  const getBlobFromNetwork = (url) => {
    return fetcher(url, { method: "GET" }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      return res.blob();
    });
  };

  const getBlobFromCacheOrNetwork = (url) => {
    const canUseCache =
      useCache &&
      typeof window !== "undefined" &&
      typeof caches !== "undefined";

    if (!canUseCache) {
      return getBlobFromNetwork(url);
    }

    return caches.open(CACHE_NAME).then((cache) => {
      return cache.match(url).then((cached) => {
        if (!cached) {
          if (!fetchLock.has(url)) {
            const task = fetcher(url, { method: "GET" })
              .then((res) => {
                if (!res.ok) {
                  throw new Error(`HTTP ${res.status}`);
                }

                return cache.put(url, res.clone()).then(() => res);
              })
              .finally(() => {
                fetchLock.delete(url);
              });

            fetchLock.set(url, task);
          }

          return fetchLock.get(url).then((res) => res.clone());
        }

        return cached.clone();
      });
    }).then((cached) => {
      return touchCache(url).then(() => cached.blob());
    });
  };

  const updateObjectUrl = (nextSrc) => {
    const oldSrc = currentSrc;

    currentSrc = nextSrc;
    setSrc(nextSrc);

    if (oldSrc && oldSrc !== nextSrc) {
      revokeObjectUrl(oldSrc);
    }
  };

  const load = () => {
    const url = remoteUrl();

    if (!url) return Promise.resolve();

    const currentReqId = ++reqId;
    setLoading(true);
    setError(null);

    return getBlobFromCacheOrNetwork(url)
      .then((blob) => {
        if (currentReqId !== reqId) return;

        const nextSrc = URL.createObjectURL(blob);
        updateObjectUrl(nextSrc);
        setLoading(false);
      })
      .catch((e) => {
        if (currentReqId !== reqId) return;

        setError(e);
        setLoading(false);
        setSrc("");
      });
  };

  createEffect(() => {
    useCache;
    maxAge;
    purgeExpiredCache();
  });

  createEffect(() => {
    const url = remoteUrl();

    if (!url) {
      updateObjectUrl("");
      setLoading(false);
      setError(null);
      return;
    }

    load();

    onCleanup(() => {
      reqId += 1;
    });
  });

  onCleanup(() => {
    revokeObjectUrl(currentSrc);
  });

  return {
    src,
    avatarSrc: src,
    loading,
    error,
    reload: load,
  };
}