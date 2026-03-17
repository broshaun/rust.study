// SizedBox.jsx
import React from "react";
import styles from "./SizedBox.module.css";

const toUnit = (value) => (typeof value === "number" ? `${value}px` : value);

const crossAlignMap = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
  stretch: "stretch",
};

const mainAlignMap = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
  between: "space-between",
};

export const SizedBox = ({
  children,
  width,
  height,

  /* 盒子里的内容排列 */
  align,
  justify,

  className = "",
  style,
}) => {
  const resolvedStyle = {
    "--sb-w": width !== undefined ? toUnit(width) : undefined,
    "--sb-h": height !== undefined ? toUnit(height) : undefined,
    "--sb-align": align ? crossAlignMap[align] || align : undefined,
    "--sb-justify": justify ? mainAlignMap[justify] || justify : undefined,
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