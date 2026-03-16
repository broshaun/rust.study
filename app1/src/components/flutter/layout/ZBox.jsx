import styles from "./ZBox.module.css";

const toUnit = (v) => {
  if (v == null || v === "") return undefined;
  return typeof v === "number" ? `${v}px` : v;
};

const posMap = {
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

const Layer = (props) => {
  const vars = {
    "--zb-pos": posMap[props.position || "center"] || "center",
    "--zb-z": props.z ?? 0,
    ...(props.style || {}),
  };

  return (
    <div
      class={styles.layer}
      data-pos={props.position || "center"}
      style={vars}
    >
      {props.children}
    </div>
  );
};

export const ZBox = (props) => {
  const vars = {
    "--zb-w": toUnit(props.width ?? "100%") || "100%",
    "--zb-h": toUnit(props.height ?? "100%") || "100%",
    "--zb-overflow": props.clip ? "hidden" : "visible",
    ...(props.style || {}),
  };

  return (
    <div class={styles.zbox} style={vars}>
      {props.children}
    </div>
  );
};

ZBox.Layer = Layer;

export default ZBox;