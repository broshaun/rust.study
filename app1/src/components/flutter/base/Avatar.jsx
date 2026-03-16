import { createMemo } from "solid-js";
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

export const Avatar = (props) => {
  const f = (v) => (typeof v === "number" ? `${v}px` : v);

  /**
   * 最终图片地址
   */
  const finalSrc = createMemo(() => {
    if (!isValidSrc(props.src)) return DEFAULT_AVATAR;
    return props.src;
  });

  /**
   * 样式计算
   */
  const dynamicStyle = createMemo(() => {
    let borderRadius = "50%";
    const variant = props.variant || "circle";

    if (variant === "square") borderRadius = "0px";

    if (variant === "rounded") {
      borderRadius = props.roundedRadius
        ? f(props.roundedRadius)
        : "var(--radius-main)";
    }

    const size = props.size ?? 50;

    return {
      width: size === "auto" ? "100%" : f(size),
      height: size === "auto" ? "100%" : f(size),
      "border-radius": borderRadius,
      "object-fit": props.fit || "cover",
      ...(props.style || {}),
    };
  });

  return (
    <div
      class={[styles.avatarContainer, props.className || ""].filter(Boolean).join(" ")}
      style={dynamicStyle()}
    >
      <img
        src={finalSrc()}
        alt={props.alt || "头像"}
        class={styles.img}
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
};