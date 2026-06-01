import React from "react";
import styles from "./SizedBox.module.css";

const toUnit = (value) =>
  typeof value === "number" ? `${value}px` : value;

export const SizedBox = ({
  width,
  height,
  className = "",
  style,
}) => {
  return (
    <div
      className={[styles.sizedBox, className].filter(Boolean).join(" ")}
      style={{
        width: toUnit(width),
        height: toUnit(height),
        ...style,
      }}
    />
  );
};

export default SizedBox;