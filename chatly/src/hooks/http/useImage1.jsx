import { useState, useEffect } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { BaseDirectory, mkdir, writeFile, exists, readFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

const IMAGE_DIR = "images";
const DEFAULT_IMAGE = "/favicon.png";
const DEFAULT_EXT = "jpg";

// 验证是否 MD5 文件名
const isMD5FileName = (fileName) => /^[a-fA-F0-9]{32}\.[a-zA-Z0-9]+$/.test(fileName);

// 从 URL 提取文件名
const getFileNameFromUrl = (url) => url?.split("/").filter(Boolean).pop();

// 字节数组转 ObjectURL
const bytesToObjectURL = (bytes, ext) =>
  URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: `image/${ext}` }));

export function useImage(url) {
  const [state, setState] = useState({
    src: DEFAULT_IMAGE,
    loading: false,
    error: null,
    success: false,
  });

  useEffect(() => {
    if (!url) return;

    let canceled = false;
    const updateState = (updates) => !canceled && setState((prev) => ({ ...prev, ...updates }));

    (async () => {
      updateState({ loading: true, error: null, success: false });

      try {
        const fileName = getFileNameFromUrl(url);
        if (!isMD5FileName(fileName)) throw new Error(`文件名不合法（必须是MD5）：${fileName}`);

        const [name, ext = DEFAULT_EXT] = fileName.split(".");
        const filePath = await join(IMAGE_DIR, fileName);
        const baseDirOption = { baseDir: BaseDirectory.AppData };

        // 读取本地缓存
        if (await exists(filePath, baseDirOption)) {
          const bytes = await readFile(filePath, baseDirOption);
          updateState({ src: bytesToObjectURL(bytes, ext), loading: false, success: true });
          return;
        }

        // 下载并缓存
        const res = await fetch(url, { method: "GET", responseType: 2 });
        if (!res.ok) throw new Error(`HTTP ${res.status}: 图片下载失败`);
        const bytes = await res.bytes();

        await mkdir(IMAGE_DIR, { ...baseDirOption, recursive: true });
        await writeFile(filePath, bytes, baseDirOption);

        updateState({ src: bytesToObjectURL(bytes, ext), loading: false, success: true });
      } catch (err) {
        console.error("useImages加载/缓存失败:", err?.message || err);
        updateState({ src: DEFAULT_IMAGE, loading: false, error: err?.message || "图片下载失败", success: false });
      }
    })();

    return () => {
      canceled = true;
    };
  }, [url]);

  return state;
}