import React, { Children, isValidElement } from "react";
import styles from "./YBox.module.css";

const toUnit = (value) => {
  if (value == null || value === "") return undefined;
  return typeof value === "number" ? `${value}px` : value;
};

const alignMap = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
  stretch: "stretch",
};

const justifyMap = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
  between: "space-between",
};

const Segment = ({
  children,
  align,
  width,
  className = "",
  style,
}) => {
  const resolvedStyle = {
    "--yb-seg-width": width != null ? toUnit(width) : "100%",
    "--yb-seg-align": align
      ? alignMap[align] || align
      : "var(--yb-seg-align-default)",
    ...style,
  };

  return (
    <div
      className={[styles.segment, className].filter(Boolean).join(" ")}
      style={resolvedStyle}
    >
      {children}
    </div>
  );
};

Segment.__YBOX_SEGMENT__ = true;

export const YBox = ({
  children,
  width = "100%",
  height,
  gap = 0,
  padding = 0,
  align = "stretch",
  justify = "top",
  scroll = false,
  className = "",
  style,
  ref,
}) => {
  const resolvedStyle = {
    "--yb-w": toUnit(width) || "100%",
    "--yb-h": toUnit(height) || "auto",
    "--yb-gap": toUnit(gap) || "0px",
    "--yb-pad": toUnit(padding) || "0px",
    "--yb-justify": justifyMap[justify] || justify,
    "--yb-align": alignMap[align] || align,
    "--yb-seg-align-default": alignMap[align] || align,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={[styles.ybox, className].filter(Boolean).join(" ")}
      style={resolvedStyle}
      data-scroll={scroll ? "true" : "false"}
    >
      {Children.map(children, (child) => {
        if (child == null) return null;
        if (isValidElement(child) && child.type?.__YBOX_SEGMENT__) return child;
        return <Segment>{child}</Segment>;
      })}
    </div>
  );
};

YBox.Segment = Segment;
export default YBox;