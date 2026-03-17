import React from "react";
import styles from "./ZBox.module.css";

const toUnit = (value) => {
  if (value == null || value === "") return undefined;
  return typeof value === "number" ? `${value}px` : value;
};

const positionMap = {
  center: "center",
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
  "top-left": "top-left",
  "top-right": "top-right",
  "bottom-left": "bottom-left",
  "bottom-right": "bottom-right",
  fill: "fill",
};

const Layer = ({
  children,
  position = "center",
  z = 0,
  className = "",
  style,
}) => {
  const resolvedStyle = {
    "--zb-z": z,
    ...style,
  };

  const resolvedPosition = positionMap[position] || "center";

  return (
    <div
      className={[styles.layer, className].filter(Boolean).join(" ")}
      data-pos={resolvedPosition}
      style={resolvedStyle}
    >
      {children}
    </div>
  );
};

Layer.__ZBOX_LAYER__ = true;

export const ZBox = ({
  children,
  width = "100%",
  height = "100%",
  clip = false,
  className = "",
  style,
  ref,
}) => {
  const resolvedStyle = {
    "--zb-w": toUnit(width) || "100%",
    "--zb-h": toUnit(height) || "100%",
    "--zb-overflow": clip ? "hidden" : "visible",
    ...style,
  };

  return (
    <div
      ref={ref}
      className={[styles.zbox, className].filter(Boolean).join(" ")}
      style={resolvedStyle}
    >
      {children}
    </div>
  );
};

ZBox.Layer = Layer;

export default ZBox;