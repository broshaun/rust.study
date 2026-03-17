import React, { useMemo } from "react";
import styles from "./Avatar.module.css";

/**
 * 获取绝对基础路径
 * 解决部署在子目录（如 domain.com/app/）时相对路径失效的问题
 */
const getStaticPath = (path) => {
  // 移除路径开头的斜杠
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // 方案 A: 如果你使用的是 Vite/Webpack，通常可以从环境变量获取 base
  // 方案 B: 原生动态拼接（最稳健）
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
  
  // 返回拼接后的 static 资源地址
  return new URL(`static/${cleanPath}`, baseUrl).href;
};

// 预定义默认头像地址
const DEFAULT_AVATAR = getStaticPath('favicon.png');

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
   * 判断是否为合法的本地资源
   */
  const isValidSrc = useMemo(() => {
    if (!src) return false;
    return (
      src.startsWith("blob:") ||
      src.startsWith("data:") ||
      src.startsWith("/") ||
      src.startsWith("./")
    );
  }, [src]);

  /**
   * 最终图片路径
   * 如果 src 无效，则指向 static 文件夹下的默认图
   */
  const finalSrc = useMemo(() => {
    return isValidSrc ? src : DEFAULT_AVATAR;
  }, [isValidSrc, src]);

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
          // 容错处理：确保 onError 也能找到正确的 static 路径
          if (e.currentTarget.src !== DEFAULT_AVATAR) {
            e.currentTarget.src = DEFAULT_AVATAR;
          }
        }}
      />
    </div>
  );
});