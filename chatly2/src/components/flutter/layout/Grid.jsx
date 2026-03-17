import React, { Children, isValidElement } from "react";
import styles from "./Grid.module.css";

const toUnit = (value) => {
  if (value == null || value === "") return undefined;
  return typeof value === "number" ? `${value}px` : value;
};

const alignMap = {
  top: "start",
  middle: "center",
  bottom: "end",
  stretch: "stretch",
};

const justifyMap = {
  left: "start",
  center: "center",
  right: "end",
  stretch: "stretch",
};

/**
 * Grid.Item
 */
const Item = ({
  children,
  col = 1,
  row = 1,
  colStart,
  rowStart,
  padding = 0,
  align,
  vertical,
  className = "",
  style,
}) => {
  const resolvedStyle = {
    "--gd-item-col": Math.max(1, Number(col) || 1),
    "--gd-item-row": Math.max(1, Number(row) || 1),
    "--gd-item-col-start":
      colStart == null || colStart === "" ? "auto" : Number(colStart),
    "--gd-item-row-start":
      rowStart == null || rowStart === "" ? "auto" : Number(rowStart),
    "--gd-item-pad": toUnit(padding) || "0px",
    "--gd-item-justify": align
      ? justifyMap[align] || align
      : "var(--gd-item-justify-default)",
    "--gd-item-align": vertical
      ? alignMap[vertical] || vertical
      : "var(--gd-item-align-default)",
    ...style,
  };

  return (
    <div
      className={[styles.item, className].filter(Boolean).join(" ")}
      style={resolvedStyle}
    >
      {children}
    </div>
  );
};

Item.__GRID_ITEM__ = true;

/**
 * Grid
 * React 19 写法：直接从 props 接 ref
 */
export const Grid = ({
  children,
  width = "100%",
  height,
  columns = 2,
  rows,
  gap = 0,
  columnGap,
  rowGap,
  padding = 0,
  justify = "stretch",
  align = "stretch",
  dense = false,

  border = false,
  borderColor,
  borderWidth = 1,
  radius,

  panel = false,
  background,
  shadow,
  clip = false,

  className = "",
  style,
  ref,
}) => {
  const normalizedColumns = Math.max(1, Number(columns) || 1);

  const rowTemplate = Array.isArray(rows)
    ? rows.map((v) => toUnit(v) || "auto").join(" ")
    : typeof rows === "number"
      ? `repeat(${Math.max(1, rows)}, minmax(0, 1fr))`
      : rows || "auto";

  const resolvedStyle = {
    "--gd-w": toUnit(width) || "100%",
    "--gd-h": toUnit(height) || "auto",
    "--gd-columns": `repeat(${normalizedColumns}, minmax(0, 1fr))`,
    "--gd-rows": rowTemplate,

    "--gd-gap": toUnit(gap) || "0px",
    "--gd-col-gap": toUnit(columnGap) || "var(--gd-gap)",
    "--gd-row-gap": toUnit(rowGap) || "var(--gd-gap)",
    "--gd-pad": toUnit(padding) || "0px",

    "--gd-justify-items": justifyMap[justify] || justify,
    "--gd-align-items": alignMap[align] || align,

    "--gd-border-width": border ? toUnit(borderWidth) || "1px" : "0px",
    "--gd-border-color":
      borderColor ||
      "rgba(var(--text-primary-rgb), 0.12)",
    "--gd-radius": toUnit(radius) || "var(--radius-main, 16px)",

    "--gd-bg": background || (panel ? "var(--panel-bg)" : "transparent"),
    "--gd-shadow": shadow || (panel ? "var(--panel-shadow)" : "none"),
    "--gd-backdrop": panel ? "var(--panel-blur)" : "none",
    "--gd-overflow": clip ? "hidden" : "visible",

    "--gd-item-justify-default": justifyMap[justify] || justify,
    "--gd-item-align-default": alignMap[align] || align,

    ...style,
  };

  return (
    <div
      ref={ref}
      className={[styles.grid, className].filter(Boolean).join(" ")}
      style={resolvedStyle}
      data-dense={dense ? "true" : "false"}
    >
      {Children.map(children, (child) => {
        if (child == null) return null;
        if (!isValidElement(child)) return <Item>{child}</Item>;
        if (child.type?.__GRID_ITEM__) return child;
        return <Item>{child}</Item>;
      })}
    </div>
  );
};

Grid.Item = Item;

export default Grid;