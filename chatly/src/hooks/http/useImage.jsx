import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiBase } from "./useApiBase";
import { useHttpFetch } from "./useHttpFetch";
import { db } from "hooks/db";

const CACHE_NAME = "img-hash-v1";
const fetchLock = new Map();

export function useImage(baseUrl, hashName, opt = {}) {
  const { apiBase } = useApiBase();
  const { fetcher } = useHttpFetch();

  const {
    enabled = true,
    isAvatar = false,
    avatarSize = 128,
    avatarType = "image/jpeg",
    avatarQuality = 0.82,
    maxAge = 7 * 24 * 60 * 60 * 1000 // 默认 7 天不读则清空
  } = opt;

  const [src, setSrc] = useState("");
  const [avatarSrc, setAvatarSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const curRef = useRef("");
  const avatarRef = useRef("");
  const reqIdRef = useRef(0);

  const remoteUrl = useMemo(() => {
    if (!hashName) return "";
    const base = `${apiBase || ""}${baseUrl}`.replace(/\/+$/, "");
    return `${base}/${hashName}`;
  }, [apiBase, baseUrl, hashName]);

  const revoke = (u) => u?.startsWith("blob:") && URL.revokeObjectURL(u);

  /**
   * 自动清理机制：删除很久没读过的缓存
   */
  const purgeExpiredCache = useCallback(async () => {
    try {
      const now = Date.now();
      // 1. 从 Dexie 找出所有过期的记录
      const expiredRecords = await db.imageMetadata
        .filter(item => (now - item.lastAccessed) > maxAge)
        .toArray();

      if (expiredRecords.length > 0) {
        const cache = await caches.open(CACHE_NAME);
        for (const record of expiredRecords) {
          await cache.delete(record.url); // 删除物理缓存
          await db.imageMetadata.delete(record.url); // 删除数据库记录
          console.log(`[useImage] Purged stale cache: ${record.url}`);
        }
      }
    } catch (e) {
      console.warn("[useImage] Purge failed", e);
    }
  }, [maxAge]);

  /**
   * 记录/更新访问时间
   */
  const touchCache = async (url) => {
    try {
      await db.imageMetadata.put({ url, lastAccessed: Date.now() });
    } catch (e) {
      console.warn("[useImage] Touch failed", e);
    }
  };

  const makeSquareAvatarBlob = useCallback(async (blob) => {
    if (!blob) return blob;
    const imageUrl = URL.createObjectURL(blob);
    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = imageUrl;
      });
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = avatarSize;
      canvas.height = avatarSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return blob;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, side, side, 0, 0, avatarSize, avatarSize);
      return await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b || blob), avatarType, avatarQuality);
      });
    } catch (e) { return blob; } finally { revoke(imageUrl); }
  }, [avatarSize, avatarType, avatarQuality]);

  const load = useCallback(async () => {
    if (!enabled || !remoteUrl) {
      setLoading(false);
      return;
    }

    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);

    const hasCacheSupport = typeof window !== 'undefined' && !!window.caches;

    try {
      let blob;
      if (hasCacheSupport) {
        const cache = await caches.open(CACHE_NAME);
        let response = await cache.match(remoteUrl);

        if (!response) {
          if (!fetchLock.has(remoteUrl)) {
            const p = fetcher(remoteUrl).then(async (res) => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              await cache.put(remoteUrl, res.clone());
              return res;
            }).finally(() => fetchLock.delete(remoteUrl));
            fetchLock.set(remoteUrl, p);
          }
          await fetchLock.get(remoteUrl);
          response = await cache.match(remoteUrl);
        } else {
          response = response.clone();
        }
        
        // 🚩 只要读取成功，就更新 Dexie 中的访问时间
        touchCache(remoteUrl);
        blob = await response.blob();
      } else {
        const res = await fetcher(remoteUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        blob = await res.blob();
      }

      if (reqId !== reqIdRef.current) return;

      const objUrl = URL.createObjectURL(blob);
      const oldSrc = curRef.current;
      curRef.current = objUrl;
      setSrc(objUrl);

      if (isAvatar) {
        const aBlob = await makeSquareAvatarBlob(blob);
        if (reqId !== reqIdRef.current) return;
        const aUrl = URL.createObjectURL(aBlob);
        const oldAvatar = avatarRef.current;
        avatarRef.current = aUrl;
        setAvatarSrc(aUrl);
        if (oldAvatar) setTimeout(() => revoke(oldAvatar), 1000);
      } else {
        setAvatarSrc(objUrl);
      }

      setLoading(false);
      if (oldSrc) setTimeout(() => revoke(oldSrc), 1000);

    } catch (e) {
      console.error("[useImage] Load Error:", e);
      if (reqId === reqIdRef.current) {
        setError(e);
        setLoading(false);
        setSrc(remoteUrl);
        setAvatarSrc(remoteUrl);
      }
    }
  }, [enabled, remoteUrl, fetcher, isAvatar, makeSquareAvatarBlob]);

  useEffect(() => {
    load();
    // 🚩 每次挂载时静默清理一次过期缓存
    purgeExpiredCache();
    return () => { reqIdRef.current++; };
  }, [load, purgeExpiredCache]);

  return { src, avatarSrc, loading, error, url: remoteUrl, reload: load };
}