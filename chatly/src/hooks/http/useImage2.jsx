// src/hooks/useCachedImage.jsx
import { useState, useEffect } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { BaseDirectory, mkdir, writeFile, exists, readFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

const IMAGE_DIR = "images"; // 缓存目录（AppData 下）
const DEFAULT_IMAGE = "/favicon.png";
const DEFAULT_EXT = "jpg";

// 验证 MD5 文件名
const isMD5FileName = (fileName) =>
  /^[a-fA-F0-9]{32}\.[a-zA-Z0-9]+$/.test(fileName);

// 从 URL 提取文件名
const getFileNameFromUrl = (url) =>
  url?.split("/").filter(Boolean).pop();

// 字节数组转 Object URL
const bytesToObjectURL = (bytes, ext) =>
  URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: `image/${ext}` }));

/**
 * useCachedImage Hook
 * 下载图片到 AppData，可动态生成 Object URL 显示
 */
export function useCachedImage(url) {
  const [src, setSrc] = useState(DEFAULT_IMAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!url) return;
    let canceled = false;

    async function loadImage() {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const fileName = getFileNameFromUrl(url);
        if (!isMD5FileName(fileName))
          throw new Error(`文件名不合法（必须是MD5）：${fileName}`);
        const [name, ext = DEFAULT_EXT] = fileName.split(".");

        // 拼接 AppData 下完整路径
        const filePath = await join(IMAGE_DIR, fileName);

        // 创建缓存目录
        const dirPath = await join(IMAGE_DIR);
        const dirExists = await exists(dirPath, { baseDir: BaseDirectory.AppData });
        if (!dirExists) {
          await mkdir(dirPath, { baseDir: BaseDirectory.AppData, recursive: true });
        }

        let bytes;
        // 1️⃣ 读取缓存
        if (await exists(filePath, { baseDir: BaseDirectory.AppData })) {
          bytes = await readFile(filePath, { baseDir: BaseDirectory.AppData });
        } else {
          // 2️⃣ 下载图片
          const res = await fetch(url, { method: "GET", responseType: 2 });
          if (!res.ok) throw new Error(`HTTP ${res.status}: 图片下载失败`);
          bytes = await res.bytes();

          // 3️⃣ 写入缓存
          await writeFile(filePath, bytes, { baseDir: BaseDirectory.AppData });
        }

        // 4️⃣ 每次渲染生成 Object URL
        const objectURL = bytesToObjectURL(bytes, ext);
        if (!canceled) setSrc(objectURL);
        if (!canceled) setSuccess(true);

      } catch (err) {
        console.error("useCachedImage加载/缓存失败:", err);
        if (!canceled) {
          setSrc(DEFAULT_IMAGE);
          setError(err?.message || "图片加载失败");
          setSuccess(false);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    loadImage();
    return () => { canceled = true; };
  }, [url]);

  return { src, loading, error, success };
}