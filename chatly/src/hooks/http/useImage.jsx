import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiBase } from "./useApiBase";
import { useHttpFetch } from "./useHttpFetch";

const DEFAULT_CACHE_NAME = "img-hash-v1";
const fetchLock = new Map();

/**
 * useImage - 增强版头像/图片缓存加载 Hook
 */
export function useImage(baseUrl, hashName, opt = {}) {
  const { apiBase } = useApiBase();
  const { fetcher } = useHttpFetch();

  const {
    enabled = true,
    cacheName = DEFAULT_CACHE_NAME,
    isAvatar = false, // 是否开启头像模式
  } = opt;

  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const curRef = useRef("");
  const reqIdRef = useRef(0);

  // 1. 远程路径计算
  const remoteUrl = useMemo(() => {
    if (!hashName) return "";
    // 如果是头像模式且 baseUrl 不包含 avatars，可在此处进行逻辑增强
    const base = `${apiBase || ""}${baseUrl}`.replace(/\/+$/, "");
    return `${base}/${hashName}`;
  }, [apiBase, baseUrl, hashName]);

  // 2. 新增：头像化路径处理 (用于 UI 显式区分)
  const avatarSrc = useMemo(() => {
    if (!src) return "";
    // 如果需要对头像 Blob URL 做进一步包装，可在此处处理
    return src; 
  }, [src]);

  const revoke = (u) => u?.startsWith("blob:") && URL.revokeObjectURL(u);

  const clearLocal = useCallback(() => {
    reqIdRef.current++;
    if (curRef.current) {
      revoke(curRef.current);
      curRef.current = "";
    }
    setSrc("");
    setError(null);
  }, []);

  const clearAllCache = useCallback(async () => {
    clearLocal();
    setLoading(true);
    try {
      await caches.delete(cacheName);
      fetchLock.clear();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [cacheName, clearLocal]);

  const load = useCallback(async () => {
    if (!enabled || !remoteUrl) {
      clearLocal();
      setLoading(false);
      return;
    }

    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const cache = await caches.open(cacheName);
      let response = await cache.match(remoteUrl);
      
      if (!response) {
        if (!fetchLock.has(remoteUrl)) {
          const fetchPromise = fetcher(remoteUrl).then(async (res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await cache.put(remoteUrl, res.clone());
            return res;
          }).finally(() => {
            fetchLock.delete(remoteUrl);
          });
          fetchLock.set(remoteUrl, fetchPromise);
        }
        response = await fetchLock.get(remoteUrl);
      }

      const blob = await response.clone().blob();
      if (reqId !== reqIdRef.current) return;

      const objUrl = URL.createObjectURL(blob);
      if (curRef.current) revoke(curRef.current);
      
      curRef.current = objUrl;
      setSrc(objUrl);
      setLoading(false);
    } catch (e) {
      if (reqId === reqIdRef.current) {
        setError(e);
        setLoading(false);
        setSrc("");
      }
    }
  }, [enabled, remoteUrl, cacheName, fetcher, clearLocal]);

  useEffect(() => {
    load();
    return () => clearLocal();
  }, [load, clearLocal]);

  return { 
    src,           // 通用图片路径
    avatarSrc,     // 专门用于头像的路径接口
    loading,
    error,
    url: remoteUrl,
    reload: load,
    clearAll: clearAllCache
  };
}