import React, { Children, isValidElement } from "react";
import styles from "./XBox.module.css";

const toUnit = (value) => {
  if (value == null || value === "") return undefined;
  return typeof value === "number" ? `${value}px` : value;
};

const horizontalMap = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

const verticalMap = {
  top: "flex-start",
  center: "center",
  bottom: "flex-end",
};

const Segment = ({
  children,
  span = 1,
  align = "center",
  vertical = "center",
  className = "",
  style,
}) => {
  return (
    <div
      className={[styles.segment, className].filter(Boolean).join(" ")}
      style={{
        flex: `${Math.max(0, Number(span) || 1)} 1 0%`,
        justifyContent: horizontalMap[align] || "center",
        alignItems: verticalMap[vertical] || "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

Segment.__XBOX_SEGMENT__ = true;

export const XBox = ({
  children,
  width = "100%",
  height,
  padding = 0,
  margin = 0,
  gap = 0,
  className = "",
  style,
  ref,
}) => {
  return (
    <div
      ref={ref}
      className={[styles.xbox, className].filter(Boolean).join(" ")}
      style={{
        width: toUnit(width) || "100%",
        height: toUnit(height) || "auto",
        padding: toUnit(padding) || "0px",
        margin: toUnit(margin) || "0px",
        gap: toUnit(gap) || "0px",
        ...style,
      }}
    >
      {Children.map(children, (child) => {
        if (child == null) return null;
        if (isValidElement(child) && child.type?.__XBOX_SEGMENT__) return child;
        return <Segment>{child}</Segment>;
      })}
    </div>
  );
};

XBox.Segment = Segment;
export default XBox;