import styles from "./SizedBox.module.css";

/**
 * SizedBox - 纯净空间调节器
 * 职责：强制锁定物理尺寸。既可作为内容的容器，也可作为纯粹的间距占位。
 */
export const SizedBox = (props) => {
  const f = (v) => (typeof v === "number" ? `${v}px` : v);

  const style = {
    "--sb-w": props.width !== undefined ? f(props.width) : undefined,
    "--sb-h": props.height !== undefined ? f(props.height) : undefined,
  };

  return (
    <div class={styles.sizedBox} style={style}>
      {props.children}
    </div>
  );
};