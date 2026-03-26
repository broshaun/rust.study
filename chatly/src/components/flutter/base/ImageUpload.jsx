import React, { useCallback, useRef, useState, useEffect, memo, useImperativeHandle } from "react";
import { Box } from "@mantine/core";

/**
 * ImageUpload - React 19 
 * 1. 支持 Ref 获取 file: uploadRef.current.file
 * 2. 支持 onDirtyChange 回调实时感知是否有文件
 */
const ImageUpload = memo(({
  maxSize = 5,
  acceptTypes = ["image/jpeg", "image/png", "image/webp"],
  children,
  size = 32,
  onError,
  onDirtyChange, // 🌟 新增：(isDirty: boolean) => void
  ref, 
}) => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // 暴露 API
  useImperativeHandle(ref, () => ({
    file, 
    clear: () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      setFile(null);
      onDirtyChange?.(false); // 🌟 清除时通知父组件
      if (inputRef.current) inputRef.current.value = "";
    }
  }), [file, previewUrl, onDirtyChange]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!acceptTypes.includes(f.type)) {
      onError?.({ type: "format", message: "格式不支持" });
    } else if (f.size > maxSize * 1024 * 1024) {
      onError?.({ type: "size", message: `不能超过${maxSize}MB` });
    } else {
      const url = URL.createObjectURL(f);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(f);
      setPreviewUrl(url);
      onDirtyChange?.(true); // 🌟 选图成功后通知父组件
    }
    e.target.value = "";
  }, [acceptTypes, maxSize, onError, previewUrl, onDirtyChange]);

  return (
    <Box
      component="span"
      onClick={() => inputRef.current?.click()}
      style={{
        display: "inline-flex",
        cursor: "pointer",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "4px",
        border: previewUrl ? "1px solid var(--mantine-color-default-border)" : "none",
        backgroundColor: "var(--mantine-color-gray-0)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptTypes.join(",")}
        onChange={handleFile}
        style={{ display: "none" }}
      />

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="preview"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        children
      )}
    </Box>
  );
});

ImageUpload.displayName = "ImageUpload";

export default ImageUpload;