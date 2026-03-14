import React, { useMemo } from "react";
import styles from "./Avatar.module.css";

/**
 * 修复部署环境下 static 路径 404 的逻辑
 */
const getStaticAsset = (path) => {
  const cleanPath = path.replace(/^\//, "");
  // 确保不管在什么子路径部署，都能通过相对基准找到 static
  const baseUrl = window.location.origin + (import.meta.env?.BASE_URL || "/");
  return new URL(`static/${cleanPath}`, baseUrl).href;
};

const DEFAULT_AVATAR = getStaticAsset("favicon.png");

export const Avatar = React.memo(({
  src,
  alt = "头像",
  variant = "circle",
  size = 50,
  fit = "cover",
  roundedRadius,
  className = "",
  style = {}
}) => {
  const f = (v) => (typeof v === "number" ? `${v}px` : v);

  const finalSrc = useMemo(() => {
    if (!src) return DEFAULT_AVATAR;
    const s = String(src);
    // 允许本地地址、Base64 或 Blob
    const isLocal = s.startsWith("blob:") || s.startsWith("data:") || s.startsWith("/") || s.startsWith("./");
    // 如果是外部 http 连接且不支持缓存降级时，这里也允许通过
    const isHttp = s.startsWith("http");
    
    return (isLocal || isHttp) ? src : DEFAULT_AVATAR;
  }, [src]);

  const dynamicStyle = useMemo(() => {
    let borderRadius = "50%";
    if (variant === "square") borderRadius = "0px";
    if (variant === "rounded") {
      borderRadius = roundedRadius ? f(roundedRadius) : "var(--radius-main)";
    }

    return {
      width: size === "auto" ? "100%" : f(size),
      height: size === "auto" ? "100%" : f(size),
      borderRadius,
      objectFit: fit,
      ...style
    };
  }, [variant, size, fit, roundedRadius, style]);

  return (
    <div className={`${styles.avatarContainer} ${className}`} style={dynamicStyle}>
      <img
        src={finalSrc}
        alt={alt}
        className={styles.img}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          if (e.currentTarget.src !== DEFAULT_AVATAR) {
            e.currentTarget.src = DEFAULT_AVATAR;
          }
        }}
      />
    </div>
  );
});