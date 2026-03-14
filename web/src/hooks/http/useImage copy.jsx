import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiBase } from "./useApiBase";
import { useHttpFetch } from "./useHttpFetch";

const DEFAULT_CACHE_NAME = "img-hash-v1";
const fetchLock = new Map();

/**
 * useImage - 图片 / 头像缓存加载 Hook
 *
 * 功能：
 * 1. 根据 hashName 生成远程图片地址
 * 2. 使用浏览器 CacheStorage 进行图片缓存
 * 3. 自动创建 Blob URL 提供给 <img />
 * 4. 防止并发重复请求（fetchLock）
 * 5. 自动释放旧 Blob URL 避免内存泄漏
 * 6. 支持头像模式
 * 7. 头像模式下可裁剪压缩为固定规格正方形头像
 *
 * --------------------------------------------------
 * 使用示例
 * --------------------------------------------------
 *
 * const { src, loading } = useImage('/imgs', avatarHash)
 *
 * <img src={src}/>
 *
 * --------------------------------------------------
 *
 * 头像模式：
 *
 * const { avatarSrc } = useImage('/imgs', avatarHash, {
 *   isAvatar: true,
 *   avatarSize: 128,
 *   avatarType: 'image/jpeg',
 *   avatarQuality: 0.82
 * })
 *
 * <Avatar src={avatarSrc}/>
 *
 * --------------------------------------------------
 *
 * 参数
 * --------------------------------------------------
 *
 * @param {string} baseUrl
 * 图片接口路径
 *
 * 示例：
 * '/imgs'
 *
 * 最终远程地址：
 *
 * `${apiBase}${baseUrl}/${hashName}`
 *
 * @param {string} hashName
 * 图片 hash 文件名
 *
 * 示例：
 * 'a3f4b9c.png'
 *
 * @param {Object} [opt]
 * 可选配置
 *
 * @param {boolean} [opt.enabled=true]
 * 是否启用加载
 *
 * false 时：
 * - 不发起请求
 * - 清空本地 src
 *
 * @param {string} [opt.cacheName='img-hash-v1']
 * CacheStorage 缓存名称
 *
 * @param {boolean} [opt.isAvatar=false]
 * 是否启用头像模式
 *
 * @param {number} [opt.avatarSize=128]
 * 头像输出边长（像素）
 *
 * @param {string} [opt.avatarType='image/jpeg']
 * 头像导出类型
 * 可选：
 * - image/jpeg
 * - image/png
 * - image/webp
 *
 * @param {number} [opt.avatarQuality=0.82]
 * 头像压缩质量，范围 0 ~ 1
 * 仅对 jpeg / webp 生效
 *
 * --------------------------------------------------
 * 返回值
 * --------------------------------------------------
 *
 * @returns {Object}
 *
 * @returns {string} src
 * 原图 Blob URL
 *
 * @returns {string} avatarSrc
 * 头像模式专用 URL
 * 当 isAvatar=true 时，会返回“裁剪压缩后的正方形头像 URL”
 * 否则默认等同 src
 *
 * @returns {boolean} loading
 * 图片加载状态
 *
 * @returns {Error|null} error
 * 请求错误
 *
 * @returns {string} url
 * 远程图片真实地址
 *
 * @returns {Function} reload
 * 重新加载图片
 *
 * @returns {Function} clearAll
 * 清除缓存并重新加载
 */

export function useImage(baseUrl, hashName, opt = {}) {
  const { apiBase } = useApiBase();
  const { fetcher } = useHttpFetch();

  const {
    enabled = true,
    cacheName = DEFAULT_CACHE_NAME,
    isAvatar = false,
    avatarSize = 128,
    avatarType = "image/jpeg",
    avatarQuality = 0.82
  } = opt;

  const [src, setSrc] = useState("");
  const [avatarSrc, setAvatarSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const curRef = useRef("");
  const avatarRef = useRef("");
  const reqIdRef = useRef(0);

  /**
   * 远程图片地址
   */
  const remoteUrl = useMemo(() => {
    if (!hashName) return "";
    const base = `${apiBase || ""}${baseUrl}`.replace(/\/+$/, "");
    return `${base}/${hashName}`;
  }, [apiBase, baseUrl, hashName]);

  /**
   * 释放 Blob URL
   */
  const revoke = (u) => u?.startsWith("blob:") && URL.revokeObjectURL(u);

  /**
   * 将 Blob 裁剪压缩为固定规格正方形头像
   */
  const makeSquareAvatarBlob = useCallback(
    async (blob) => {
      if (!blob) return blob;

      const imageUrl = URL.createObjectURL(blob);

      try {
        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = imageUrl;
        });

        const sw = img.width;
        const sh = img.height;
        const side = Math.min(sw, sh);

        const sx = Math.max(0, (sw - side) / 2);
        const sy = Math.max(0, (sh - side) / 2);

        const canvas = document.createElement("canvas");
        canvas.width = avatarSize;
        canvas.height = avatarSize;

        const ctx = canvas.getContext("2d");
        if (!ctx) return blob;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
          img,
          sx,
          sy,
          side,
          side,
          0,
          0,
          avatarSize,
          avatarSize
        );

        const outBlob = await new Promise((resolve) => {
          canvas.toBlob(
            (b) => resolve(b || blob),
            avatarType,
            avatarQuality
          );
        });

        return outBlob || blob;
      } finally {
        URL.revokeObjectURL(imageUrl);
      }
    },
    [avatarSize, avatarType, avatarQuality]
  );

  /**
   * 清除本地 URL
   */
  const clearLocal = useCallback(() => {
    reqIdRef.current++;

    if (curRef.current) {
      revoke(curRef.current);
      curRef.current = "";
    }

    if (avatarRef.current) {
      revoke(avatarRef.current);
      avatarRef.current = "";
    }

    setSrc("");
    setAvatarSrc("");
    setError(null);
  }, []);

  /**
   * 清除所有缓存
   */
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

  /**
   * 加载图片
   */
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
          const fetchPromise = fetcher(remoteUrl)
            .then(async (res) => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              await cache.put(remoteUrl, res.clone());
              return res;
            })
            .finally(() => {
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

      if (isAvatar) {
        const avatarBlob = await makeSquareAvatarBlob(blob);
        if (reqId !== reqIdRef.current) return;

        const squareUrl = URL.createObjectURL(avatarBlob);

        if (avatarRef.current) revoke(avatarRef.current);
        avatarRef.current = squareUrl;
        setAvatarSrc(squareUrl);
      } else {
        if (avatarRef.current) {
          revoke(avatarRef.current);
          avatarRef.current = "";
        }
        setAvatarSrc(objUrl);
      }

      setLoading(false);
    } catch (e) {
      if (reqId === reqIdRef.current) {
        setError(e);
        setLoading(false);
        setSrc("");
        setAvatarSrc("");
      }
    }
  }, [
    enabled,
    remoteUrl,
    cacheName,
    fetcher,
    clearLocal,
    isAvatar,
    makeSquareAvatarBlob
  ]);

  useEffect(() => {
    load();
    return () => clearLocal();
  }, [load, clearLocal]);

  return {
    src,
    avatarSrc,
    loading,
    error,
    url: remoteUrl,
    reload: load,
    clearAll: clearAllCache
  };
}