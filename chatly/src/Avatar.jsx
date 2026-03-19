import React, { useEffect, useMemo, useState } from "react";
import styles from "./Avatar.module.css";
import { ImageCache } from "./useImages2";

const DEFAULT_AVATAR = "/favicon.png";

/**
 * 判断是否远程图片
 */
const isRemoteHttp = (src) => {
  if (!src) return false;
  const s = String(src).trim();
  return s.startsWith("http://") || s.startsWith("https://");
};

export const Avatar = React.memo(function Avatar({
  src,
  alt = "头像",
  variant = "circle", // circle | square | rounded
  size = 50,
  fit = "cover",
  roundedRadius,
  className = "",
  style = {},
}) {
  const [imgSrc, setImgSrc] = useState(DEFAULT_AVATAR);

  const toUnit = (v) => (typeof v === "number" ? `${v}px` : v);

  // 样式
  const dynamicStyle = useMemo(() => {
    let borderRadius = "50%";
    if (variant === "square") borderRadius = "0px";
    if (variant === "rounded") borderRadius = roundedRadius ? toUnit(roundedRadius) : "12px";

    return {
      width: size === "auto" ? "100%" : toUnit(size),
      height: size === "auto" ? "100%" : toUnit(size),
      borderRadius,
      ...style,
    };
  }, [variant, size, roundedRadius, style]);

  useEffect(() => {
    let disposed = false;

    const loadImage = async () => {
      if (!src) {
        setImgSrc(DEFAULT_AVATAR);
        return;
      }

      const raw = String(src).trim();

      // 如果不是远程地址，直接显示
      if (!isRemoteHttp(raw)) {
        setImgSrc(raw);
        return;
      }

      try {
        const localPath = await ImageCache.get(raw);
        if (!disposed) setImgSrc(localPath || DEFAULT_AVATAR);
      } catch (err) {
        console.error("Avatar ImageCache error:", raw, err);
        if (!disposed) setImgSrc(DEFAULT_AVATAR);
      }
    };

    loadImage();

    return () => {
      disposed = true;
    };
  }, [src]);

  return (
    <div className={`${styles.avatarContainer} ${className}`} style={dynamicStyle}>
      <img
        src={imgSrc}
        alt={alt}
        className={styles.img}
        loading="lazy"
        decoding="async"
        onError={() => {
          if (imgSrc !== DEFAULT_AVATAR) setImgSrc(DEFAULT_AVATAR);
        }}
        style={{ objectFit: fit }}
      />
    </div>
  );
});

export default Avatar;