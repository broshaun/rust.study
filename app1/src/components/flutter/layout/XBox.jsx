import { children as resolveChildren, For } from "solid-js";
import styles from "./XBox.module.css";

const toUnit = (v) => {
  if (v == null || v === "") return undefined;
  return typeof v === "number" ? `${v}px` : v;
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

const Segment = (props) => {
  const segStyle = {
    "--xb-seg-span": props.span ?? 1,
    "--xb-seg-pad": toUnit(props.padding ?? 0) || "0px",
    "--xb-seg-align": props.align
      ? justifyMap[props.align] || props.align
      : "var(--xb-seg-align-default)",
    "--xb-seg-vertical": props.vertical
      ? alignMap[props.vertical] || props.vertical
      : "var(--xb-seg-vertical-default)",
    "--xb-seg-divider-width": props.divider ? "1px" : "0px",
    "--xb-seg-divider-color":
      props.dividerColor ||
      "var(--xb-divider-color, rgba(var(--text-primary-rgb, 0, 0, 0), 0.12))",
    ...(props.style || {}),
  };

  return (
    <div
      class={[styles.segment, props.className].filter(Boolean).join(" ")}
      style={segStyle}
    >
      {props.children}
    </div>
  );
};

const normalizeChildren = (list) => {
  const flat = [];
  const walk = (item) => {
    if (Array.isArray(item)) {
      item.forEach(walk);
      return;
    }
    if (item == null || item === false || item === true) return;
    flat.push(item);
  };
  walk(list);
  return flat;
};

export const XBox = (props) => {
  const resolved = resolveChildren(() => props.children);

  const vars = {
    "--xb-w": toUnit(props.width ?? "100%") || "100%",
    "--xb-h": toUnit(props.height) || "auto",
    "--xb-gap": toUnit(props.gap ?? 0) || "0px",
    "--xb-pad": toUnit(props.padding ?? 0) || "0px",
    "--xb-align": alignMap[props.align || "middle"] || props.align || "center",
    "--xb-justify":
      justifyMap[props.justify || "center"] || props.justify || "center",
    "--xb-wrap": props.wrap ? "wrap" : "nowrap",
    "--xb-border-width": props.border
      ? toUnit(props.borderWidth ?? 1) || "1px"
      : "0px",
    "--xb-border-color":
      props.borderColor ||
      "var(--panel-border-color, rgba(var(--text-primary-rgb, 0, 0, 0), 0.12))",
    "--xb-radius": toUnit(props.radius) || "var(--radius-main, 16px)",
    "--xb-bg":
      props.background ||
      (props.panel ? "var(--panel-bg, transparent)" : "transparent"),
    "--xb-shadow":
      props.shadow || (props.panel ? "var(--panel-shadow, none)" : "none"),
    "--xb-backdrop": props.panel ? "var(--panel-blur, blur(0px))" : "blur(0px)",
    "--xb-divider-color": "rgba(var(--text-primary-rgb, 0, 0, 0), 0.12)",
    "--xb-text-color": "var(--text-primary, inherit)",
    "--xb-overflow": props.clip ? "hidden" : "visible",
    "--xb-seg-align-default":
      justifyMap[props.justify || "center"] || props.justify || "center",
    "--xb-seg-vertical-default":
      alignMap[props.align || "middle"] || props.align || "center",
    ...(props.style || {}),
  };

  return (
    <div
      class={[styles.xbox, props.className].filter(Boolean).join(" ")}
      style={vars}
    >
      <For each={normalizeChildren(resolved())}>
        {(child) => <Segment>{child}</Segment>}
      </For>
    </div>
  );
};

XBox.Segment = Segment;

export default XBox;