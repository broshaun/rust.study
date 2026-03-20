import { useState, useEffect } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { BaseDirectory, mkdir, writeFile, exists, readFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

const CACHE_DIR = "images";
const DEFAULT_IMG = "/favicon.png"; // 确保此路径在 public 下有效
const MD5_REGEX = /^[a-fA-F0-9]{32}\.[a-z0-9]+$/i;

/** * 全局内存热缓存池：存储已生成的 Blob URL。
 * 作用：跨组件共享图片资源，实现列表滚动时的同步加载（秒开）。
 */
const MEMORY_CACHE = new Map();

/**
 * @function useImage
 * @description 支持磁盘缓存与内存缓存的图片加载钩子。针对 Tauri 环境下的文件读写优化。
 * @param {string} url - 图片的完整网络地址。
 * @returns {Object} { src, loading, error, success }
 */
export function useImage(url) {
  // ✅ 同步预检：若内存中有，则直接同步初始化，消除异步加载造成的首帧闪烁
  const [state, setState] = useState(() => {
    const cached = url && MEMORY_CACHE.get(url);
    return cached 
      ? { src: cached, loading: false, error: null, success: true }
      : { src: DEFAULT_IMG, loading: false, error: null, success: false };
  });

  useEffect(() => {
    if (!url || MEMORY_CACHE.has(url)) return;

    let isCancelled = false;
    let objUrl = null;

    (async () => {
      // 仅在必要时启动 loading 状态
      if (!isCancelled) setState(p => ({ ...p, loading: true, error: null }));

      try {
        const fileName = url.split("/").pop();
        if (!fileName || !MD5_REGEX.test(fileName)) throw new Error("Format Err");

        const path = await join(CACHE_DIR, fileName);
        const opt = { baseDir: BaseDirectory.AppData };
        let bytes;

        // 1. 尝试从磁盘读取
        if (await exists(path, opt)) {
          bytes = await readFile(path, opt);
        } else {
          // 2. 磁盘无数据，发起网络请求
          const res = await fetch(url, { method: "GET", connectTimeout: 8000 });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          bytes = new Uint8Array(await res.arrayBuffer());
          
          // 确保缓存目录存在
          if (!(await exists(CACHE_DIR, opt))) {
            await mkdir(CACHE_DIR, { ...opt, recursive: true });
          }
          await writeFile(path, bytes, opt);
        }

        // 3. 将字节数据转换为 Blob URL
        const ext = fileName.split('.').pop() || 'jpeg';
        objUrl = URL.createObjectURL(new Blob([bytes], { type: `image/${ext}` }));
        
        // 4. 更新内存缓存池
        MEMORY_CACHE.set(url, objUrl);
        
        if (!isCancelled) {
          setState({ src: objUrl, loading: false, error: null, success: true });
        }
      } catch (e) {
        if (!isCancelled) {
          setState({ src: DEFAULT_IMG, loading: false, error: e.message, success: false });
        }
      }
    })();

    return () => { isCancelled = true; };
  }, [url]);

  return state;
}