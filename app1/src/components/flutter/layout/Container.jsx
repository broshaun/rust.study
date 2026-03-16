import styles from "./Container.module.css";

/**
 * Container - 主题感知容器
 *
 * 职责：
 * 1. 锁定空间
 * 2. 处理滚动
 * 3. 处理对齐
 * 4. 按需显示主题边框/背景/阴影
 *
 * 说明：
 * 当前 Container 默认是纵向布局（flex-direction: column）
 *
 * 所以：
 * - align   控制横向对齐（left / center / right / stretch）
 * - justify 控制纵向对齐（top / middle / bottom / between）
 */
export const Container = (props) => {
  const f = (v) => (typeof v === "number" ? `${v}px` : v);

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

  const vars = {
    "--cont-w": f(props.width ?? "100%"),
    "--cont-h": f(props.height ?? "100%"),
    "--cont-pad": f(props.padding ?? 0),
    "--cont-mar": f(props.margin ?? 0),
    "--cont-align":
      alignMap[props.align || "stretch"] || props.align || "stretch",
    "--cont-justify":
      justifyMap[props.justify || "top"] || props.justify || "flex-start",
    ...(props.style || {}),
  };

  return (
    <div
      ref={props.innerRef}
      class={[styles.container, props.className].filter(Boolean).join(" ")}
      style={vars}
      data-v={props.verticalScroll ? "true" : "false"}
      data-h={props.horizontalScroll ? "true" : "false"}
      data-border={props.bordered === false ? "false" : "true"}
      data-surface={props.surface === false ? "false" : "true"}
    >
      {props.children}
    </div>
  );
};

export default Container;