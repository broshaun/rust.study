import React from "react";
import styles from "./Divider.module.css";

/**
 * Divider - 分割线（布局 + 轻风格）
 * 职责：
 * 1. 提供区块分隔
 * 2. 控制间距（spacing）
 * 3. 支持 bleed / fade
 */
export const Divider = ({
  fade = false,
  spacing = 10,
  bleed = false,
  className = "",
  style,
}) => {
  return (
    <div
      className={[
        styles.divider,
        fade && styles.fade,
        bleed && styles.bleed,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        "--divider-spacing": typeof spacing === "number" ? `${spacing}px` : spacing,
        ...style,
      }}
    />
  );
};

export default Divider;