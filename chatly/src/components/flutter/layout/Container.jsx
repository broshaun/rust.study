// Container.jsx
import React from "react";
import styles from "./Container.module.css";

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

export const Container = ({
  children,
  verticalScroll = false,
  horizontalScroll = false,
  width = "100%",
  height = "100%",
  padding = 0,
  margin = 0,

  /* 盒子里的内容排列 */
  align = "stretch",
  justify = "top",

  bordered = true,
  surface = true,
  className = "",
  style,
  ref,
}) => {
  const resolvedStyle = {
    "--ct-w": toUnit(width),
    "--ct-h": toUnit(height),
    "--ct-pad": toUnit(padding),
    "--ct-mar": toUnit(margin),
    "--ct-align": crossAlignMap[align] || align,
    "--ct-justify": mainAlignMap[justify] || justify,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={[styles.container, className].filter(Boolean).join(" ")}
      style={resolvedStyle}
      data-v-scroll={verticalScroll ? "true" : "false"}
      data-h-scroll={horizontalScroll ? "true" : "false"}
      data-border={bordered ? "true" : "false"}
      data-surface={surface ? "true" : "false"}
    >
      {children}
    </div>
  );
};

export default Container;