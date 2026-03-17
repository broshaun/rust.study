import React from "react";
import styles from "./SizedBox.module.css";

/**
 * SizedBox - 尺寸占位 / 尺寸容器
 * 职责：
 * 1. 强制尺寸（width / height）
 * 2. 用作间距占位
 * 3. 可承载子内容（但不负责内容样式）
 */
export const SizedBox = ({
  children,
  width,
  height,
  className = "",
  style,
}) => {
  const toUnit = (v) => (typeof v === "number" ? `${v}px` : v);

  const resolvedStyle = {
    "--sb-w": width !== undefined ? toUnit(width) : undefined,
    "--sb-h": height !== undefined ? toUnit(height) : undefined,
    ...style,
  };

  return (
    <div
      className={[styles.sizedBox, className].filter(Boolean).join(" ")}
      style={resolvedStyle}
    >
      {children}
    </div>
  );
};

export default SizedBox;