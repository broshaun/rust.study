import React, { useMemo } from "react";
import styles from "./Avatar.module.css";

/**
 * Avatar - 纯粹 UI 头像组件
 * 职责：负责头像的物理形态展示，适配全局主题变量。
 * * @param {Object} props
 * @param {string} props.src - 由外部传入的最终图片路径 (本地地址/Blob/Base64)
 * @param {string} [props.alt="头像"] - 无障碍描述
 * @param {'circle'|'square'|'rounded'} [props.variant='circle'] - 形状映射
 * @param {number|'auto'} [props.size=50] - 尺寸控制
 * @param {'contain'|'cover'} [props.fit='cover'] - 裁剪模式
 * @param {number} [props.roundedRadius] - 自定义圆角 (默认跟随主题 --radius-main)
 * @param {string} [props.className] - 自定义类名
 * @param {React.CSSProperties} [props.style] - 自定义内联样式
 */
export const Avatar = ({
  src,
  alt = "头像",
  variant = "circle",
  size = 50,
  fit = "cover",
  roundedRadius,
  className = "",
  style = {}
}) => {
  // 尺寸辅助函数
  const f = (v) => (typeof v === "number" ? `${v}px` : v);

  // 动态计算样式
  const dynamicStyle = useMemo(() => {
    let borderRadius = "50%"; // circle 模式
    if (variant === "square") borderRadius = "0px";
    if (variant === "rounded") {
      // 默认关联主题变量 --radius-main，实现视觉一致性
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
        src={src || "/favicon.png"} // 外部传进的本地 src
        alt={alt}
        className={styles.img}
        loading="lazy"
        onError={(e) => {
          // 容错处理
          if (e.currentTarget.src !== "/favicon.png") {
            e.currentTarget.src = "/favicon.png";
          }
        }}
      />
    </div>
  );
};