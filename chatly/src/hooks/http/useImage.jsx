import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiBase } from "./useApiBase";
import { useHttpFetch } from "./useHttpFetch";

const DEFAULT_CACHE_NAME = "img-hash-v1";
// 全局请求锁：防止同一个哈希文件在多处同时下载
const fetchLock = new Map();

export function useImage(baseUrl, hashName, opt = {}) {
  const { apiBase } = useApiBase();
  const { fetcher } = useHttpFetch();

  const {
    enabled = true,
    cacheName = DEFAULT_CACHE_NAME,
  } = opt;

  // 1. 状态显式声明
  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. 引用管理
  const curRef = useRef("");
  const reqIdRef = useRef(0);

  // 3. 路径计算
  const remoteUrl = useMemo(() => {
    if (!hashName) return "";
    const base = `${apiBase || ""}${baseUrl}`.replace(/\/+$/, "");
    return `${base}/${hashName}`;
  }, [apiBase, baseUrl, hashName]);

  const revoke = (u) => u?.startsWith("blob:") && URL.revokeObjectURL(u);

  // 4. 加载逻辑
  const load = useCallback(async () => {
    if (!enabled || !remoteUrl) {
      setSrc("");
      setLoading(false);
      setError(null);
      return;
    }

    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const cache = await caches.open(cacheName);
      let response = await cache.match(remoteUrl);
      
      if (!response) {
        // --- 并发控制 ---
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
      
      // 竞态检查
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
  }, [enabled, remoteUrl, cacheName, fetcher]);

  useEffect(() => {
    load();
    return () => {
      reqIdRef.current++;
      if (curRef.current) {
        revoke(curRef.current);
        curRef.current = "";
      }
    };
  }, [load]);

  // --- 显式返回所有参数，方便一目了然 ---
  return { 
    src,        // 最终可用于 <img src={...} /> 的地址
    loading,    // 加载状态
    error,      // 错误对象
    url: remoteUrl, // 原始请求的远程 URL
    reload: load    // 手动刷新函数
  };
}