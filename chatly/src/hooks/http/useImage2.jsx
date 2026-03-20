import { useState, useEffect } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { BaseDirectory, mkdir, writeFile, exists, readFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

const CACHE_DIR = "images";
const DEFAULT_IMG = "/favicon.png";
const MD5_REGEX = /^[a-fA-F0-9]{32}\.[a-z0-9]+$/i;

export function useImage(url) {
  const [state, setState] = useState({ src: DEFAULT_IMG, loading: false, error: null, success: false });

  useEffect(() => {
    if (!url) return;
    
    let isCancelled = false;
    let objUrl = null;

    // 封装安全的状态更新函数，避免多处书写 if (!isCancelled)
    const safeUpdate = (newState) => {
      if (!isCancelled) setState(prev => ({ ...prev, ...newState }));
    };

    (async () => {
      safeUpdate({ loading: true, error: null, success: false, src: DEFAULT_IMG });

      try {
        const fileName = url.split("/").pop();
        if (!fileName || !MD5_REGEX.test(fileName)) {
          throw new Error("Invalid MD5 filename format");
        }

        const path = await join(CACHE_DIR, fileName);
        const opt = { baseDir: BaseDirectory.AppData };
        let bytes;

        // 核心逻辑：先查缓存，无则下载
        if (await exists(path, opt)) {
          bytes = await readFile(path, opt);
        } else {
          const res = await fetch(url, { method: "GET", connectTimeout: 10000 });
          if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
          
          bytes = new Uint8Array(await res.arrayBuffer());
          
          // 确保目录存在 (recursive: true 能够安全应对多图片并发下载时的目录创建冲突)
          if (!(await exists(CACHE_DIR, opt))) {
            await mkdir(CACHE_DIR, { ...opt, recursive: true });
          }
          await writeFile(path, bytes, opt);
        }

        // 安全提取后缀名，生成 Blob URL
        const ext = fileName.split('.').pop() || 'jpeg';
        objUrl = URL.createObjectURL(new Blob([bytes], { type: `image/${ext}` }));
        
        safeUpdate({ src: objUrl, loading: false, success: true });

      } catch (e) {
        console.error("Image cache error:", e);
        safeUpdate({ loading: false, error: e.message || "Unknown error", success: false });
      }
    })();

    return () => { 
      isCancelled = true; 
      if (objUrl) URL.revokeObjectURL(objUrl); 
    };
  }, [url]);

  return state;
}