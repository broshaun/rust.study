import React, { Children, isValidElement } from "react";
import styles from "./XBox.module.css";

const toUnit = (value) => {
  if (value == null || value === "") return undefined;
  return typeof value === "number" ? `${value}px` : value;
};

const alignMap = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
  stretch: "stretch",
};

const justifyMap = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
  between: "space-between",
};

/**
 * XBox.Segment
 * 职责：
 * 1. 作为 XBox 的横向分段
 * 2. 控制分段占比、内边距、对齐、分隔线
 */
const Segment = ({
  children,
  span = 1,
  padding = 0,
  align,
  vertical,
  divider = false,
  dividerColor,
  className = "",
  style,
}) => {
  const resolvedStyle = {
    "--xb-seg-span": Math.max(0, Number(span) || 1),
    "--xb-seg-pad": toUnit(padding) || "0px",
    "--xb-seg-align": align
      ? justifyMap[align] || align
      : "var(--xb-seg-align-default)",
    "--xb-seg-vertical": vertical
      ? alignMap[vertical] || vertical
      : "var(--xb-seg-vertical-default)",
    "--xb-seg-divider-width": divider ? "1px" : "0px",
    "--xb-seg-divider-color":
      dividerColor || "rgba(var(--text-primary-rgb), 0.12)",
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

Segment.__XBOX_SEGMENT__ = true;

/**
 * XBox - 横向布局容器（React 19）
 * 职责：
 * 1. 管理横向分布、间距、换行
 * 2. 可选承载容器层风格（panel / border）
 * 3. 自动将普通子元素包裹为 Segment
 */
export const XBox = ({
  children,
  width = "100%",
  height,
  gap = 0,
  padding = 0,
  align = "middle",
  justify = "center",
  wrap = false,

  border = false,
  borderColor,
  borderWidth = 1,
  radius = 0,

  panel = false,
  background,
  shadow,
  clip = false,

  className = "",
  style,
  ref,
}) => {
  const resolvedStyle = {
    "--xb-w": toUnit(width) || "100%",
    "--xb-h": toUnit(height) || "auto",
    "--xb-gap": toUnit(gap) || "0px",
    "--xb-pad": toUnit(padding) || "0px",
    "--xb-align": alignMap[align] || align,
    "--xb-justify": justifyMap[justify] || justify,
    "--xb-wrap": wrap ? "wrap" : "nowrap",

    "--xb-border-width": border ? toUnit(borderWidth) || "1px" : "0px",
    "--xb-border-color":
      borderColor || "rgba(var(--text-primary-rgb), 0.12)",
    "--xb-radius": toUnit(radius) || "0px",

    "--xb-bg": background || (panel ? "var(--panel-bg)" : "transparent"),
    "--xb-shadow": shadow || (panel ? "var(--panel-shadow)" : "none"),
    "--xb-backdrop": panel ? "var(--panel-blur)" : "none",
    "--xb-overflow": clip ? "hidden" : "visible",

    "--xb-seg-align-default": justifyMap[justify] || justify,
    "--xb-seg-vertical-default": alignMap[align] || align,

    ...style,
  };

  return (
    <div
      ref={ref}
      className={[styles.xbox, className].filter(Boolean).join(" ")}
      style={resolvedStyle}
    >
      {Children.map(children, (child) => {
        if (child == null) return null;
        if (!isValidElement(child)) return <Segment>{child}</Segment>;
        if (child.type?.__XBOX_SEGMENT__) return child;
        return <Segment>{child}</Segment>;
      })}
    </div>
  );
};

XBox.Segment = Segment;
export default XBox;