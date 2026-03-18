import React from "react";
import styles from "./YBox.module.css";

const toUnit = (value) => {
  if (value == null || value === "") return undefined;
  return typeof value === "number" ? `${value}px` : value;
};

export const YBox = ({
  children,
  width = "100%",
  height,
  gap = 0,
  padding = 0,
  scroll = false,
  className = "",
  style,
  ref,
}) => {
  return (
    <div
      ref={ref}
      className={[styles.ybox, className].filter(Boolean).join(" ")}
      style={{
        width: toUnit(width) || "100%",
        height: toUnit(height) || "auto",
        gap: toUnit(gap) || "0px",
        padding: toUnit(padding) || "0px",
        ...style,
      }}
      data-scroll={scroll ? "true" : "false"}
    >
      {children}
    </div>
  );
};

export default YBox;