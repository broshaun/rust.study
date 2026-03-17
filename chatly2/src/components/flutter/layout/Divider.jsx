import React from "react";
import styles from "./Divider.module.css";

export const Divider = ({
  fade = false,
  spacing = 10,
  bleed = false,
  className = "",
  style,
}) => {
  return (
    <div
      className={[
        styles.divider,
        fade && styles.fade,
        bleed && styles.bleed,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        "--dv-spacing": typeof spacing === "number" ? `${spacing}px` : spacing,
        ...style,
      }}
      role="separator"
      aria-hidden="true"
    />
  );
};

export default Divider;