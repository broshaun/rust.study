import { children as resolveChildren, For } from "solid-js";
import styles from "./YBox.module.css";

const toUnit = (v) => {
  if (v == null || v === "") return undefined;
  return typeof v === "number" ? `${v}px` : v;
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

export const YBoxSegment = (props) => {
  const segmentStyle = {
    "align-self": props.align
      ? alignMap[props.align] || props.align
      : "var(--yb-align)",
    width: props.width != null ? toUnit(props.width) : undefined,
    ...(props.style || {}),
  };

  return (
    <div
      class={[styles.segment, props.className].filter(Boolean).join(" ")}
      style={segmentStyle}
      data-ybox-segment="true"
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

export const YBox = (props) => {
  const resolved = resolveChildren(() => props.children);

  const vars = {
    "--yb-w": toUnit(props.width ?? "100%") || "100%",
    "--yb-h": toUnit(props.height) || "auto",
    "--yb-gap": toUnit(props.gap ?? 0) || "0px",
    "--yb-pad": toUnit(props.padding ?? 0) || "0px",
    "--yb-align":
      alignMap[props.align || "stretch"] || props.align || "stretch",
    "--yb-justify":
      justifyMap[props.justify || "top"] || props.justify || "flex-start",
    ...(props.style || {}),
  };

  const renderChild = (child) => {
    if (
      typeof Element !== "undefined" &&
      child instanceof Element &&
      child.getAttribute?.("data-ybox-segment") === "true"
    ) {
      return child;
    }

    return <YBoxSegment>{child}</YBoxSegment>;
  };

  return (
    <div
      class={[styles.ybox, props.className].filter(Boolean).join(" ")}
      style={vars}
      data-scroll={props.scroll ? "true" : "false"}
      ref={(el) => props.innerRef?.(el)}
    >
      <For each={normalizeChildren(resolved())}>{renderChild}</For>
    </div>
  );
};

export default YBox;