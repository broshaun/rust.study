import React, { useMemo } from ".pnpm/react@19.2.4/node_modules/react";
import styles from "./Avatar.module.css";

/**
 * 修复部署环境下 static 路径 404 的逻辑
 */
const getStaticAsset = (path) => {
  const cleanPath = path.replace(/^\//, "");
  const baseUrl = window.location.origin + (import.meta.env?.BASE_URL || "/");
  return new URL(`static/${cleanPath}`, baseUrl).href;
};

const DEFAULT_AVATAR = getStaticAsset("favicon.png");

/**
 * 判断是否是有效图片 URL
 */
const isValidSrc = (src) => {
  if (!src) return false;

  const s = String(src).trim();

  return (
    s.startsWith("http://") ||
    s.startsWith("https://") ||
    s.startsWith("blob:") ||
    s.startsWith("data:") ||
    s.startsWith("/") ||
    s.startsWith("./") ||
    s.startsWith("../") ||
    s.startsWith("//")
  );
};

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

  /**
   * 最终图片地址
   */
  const finalSrc = useMemo(() => {
    if (!isValidSrc(src)) return DEFAULT_AVATAR;
    return src;
  }, [src]);

  /**
   * 样式计算
   */
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
    <div
      className={`${styles.avatarContainer} ${className}`}
      style={dynamicStyle}
    >
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