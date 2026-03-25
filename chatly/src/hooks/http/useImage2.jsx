import { useState, useEffect } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { BaseDirectory, mkdir, writeFile, exists, readFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";


const CACHE_DIR = "images";
const MD5_REGEX = /^[a-fA-F0-9]{32}\.[a-z0-9]+$/i;

/**
 * 全局内存热缓存池
 * key: 原始 url
 * value: blob url
 */
const MEMORY_CACHE = new Map();

/**
 * useImage
 * 支持：内存缓存 + 磁盘缓存
 */
export function useImage(url) {
  const [state, setState] = useState(() => {
    const cached = url && MEMORY_CACHE.get(url);
    return cached
      ? { src: cached, loading: false, error: null, success: true }
      : { src: "", loading: false, error: null, success: false };
  });

  useEffect(() => {
    if (!url) {
      setState({ src: "", loading: false, error: null, success: false });
      return;
    }

    // 命中内存缓存时，要主动更新 state
    if (MEMORY_CACHE.has(url)) {
      const cached = MEMORY_CACHE.get(url);
      setState({ src: cached, loading: false, error: null, success: true });
      return;
    }

    let isCancelled = false;

    (async () => {
      if (!isCancelled) {
        setState((p) => ({ ...p, loading: true, error: null, success: false }));
      }

      try {
        const fileName = url.split("/").pop();
        if (!fileName || !MD5_REGEX.test(fileName)) {
          throw new Error("Format Err");
        }

        const path = await join(CACHE_DIR, fileName);
        const opt = { baseDir: BaseDirectory.AppData };
        let bytes;

        if (await exists(path, opt)) {
          bytes = await readFile(path, opt);
        } else {
          const res = await fetch(url, { method: "GET", connectTimeout: 8000 });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          bytes = new Uint8Array(await res.arrayBuffer());

          if (!(await exists(CACHE_DIR, opt))) {
            await mkdir(CACHE_DIR, { ...opt, recursive: true });
          }

          await writeFile(path, bytes, opt);
        }

        const ext = fileName.split(".").pop() || "jpeg";
        const objectUrl = URL.createObjectURL(
          new Blob([bytes], { type: `image/${ext}` })
        );

        MEMORY_CACHE.set(url, objectUrl);

        if (!isCancelled) {
          setState({
            src: objectUrl,
            loading: false,
            error: null,
            success: true,
          });
        }
      } catch (e) {
        if (!isCancelled) {
          setState({
            src: "",
            loading: false,
            error: e?.message || "Load failed",
            success: false,
          });
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [url]);

  return state;
}




// Tauri2应用环境
// 使用 @tauri-apps/plugin-http @tauri-apps/plugin-fs
// 使用javascript编程语言代码实现：
// 1.访问远程图片，远程地址示例：http://103.186.108.161:5015/imgs/06e5b950405c65eadfe37d1a227fb170.jpg 
// 2.得到的远程的文件名是 md5.jpg
// 3.正则判断图片名称是否符合 MD5 文件名，是就继续，否则直接返回默认图片
// 4.继续后，查找本地文件，就是MD5名称，是否有同名的，有则直接访问，无则下载图片到本地
// 5.最后返回 ObjectURL 可以用于img src 访问的路径
// 使用示例：
// const {src,loading,error,success} = useImage(url)