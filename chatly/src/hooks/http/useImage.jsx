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