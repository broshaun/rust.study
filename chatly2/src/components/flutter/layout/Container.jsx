import React from "react";
import styles from "./Container.module.css";

/**
 * Container - 通用容器（React 19）
 * 职责：
 * 1. 负责尺寸、内外边距、对齐、滚动
 * 2. 可选承载通用 surface / border 风格
 * 3. 不负责具体内容样式
 */
export const Container = ({
  children,
  verticalScroll = false,
  horizontalScroll = false,
  width = "100%",
  height = "100%",
  padding = 0,
  margin = 0,
  align = "stretch",
  justify = "top",
  bordered = true,
  surface = true,
  className = "",
  style,
  ref,
}) => {
  const toUnit = (value) => (typeof value === "number" ? `${value}px` : value);

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

  const resolvedStyle = {
    "--cont-w": toUnit(width),
    "--cont-h": toUnit(height),
    "--cont-pad": toUnit(padding),
    "--cont-mar": toUnit(margin),
    "--cont-align": alignMap[align] || align,
    "--cont-justify": justifyMap[justify] || justify,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={[styles.container, className].filter(Boolean).join(" ")}
      style={resolvedStyle}
      data-surface={surface ? "true" : "false"}
      data-border={bordered ? "true" : "false"}
      data-v-scroll={verticalScroll ? "true" : "false"}
      data-h-scroll={horizontalScroll ? "true" : "false"}
    >
      {children}
    </div>
  );
};

export default Container;