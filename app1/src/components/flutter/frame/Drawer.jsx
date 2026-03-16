import styles from "./Drawer.module.css";

/**
 * 全主题适配抽屉
 * 职责：透传主题变量，实现侧滑交互。
 */
export const Drawer = (props) => (
  <div class={[styles.container, props.isOpen ? styles.open : ""].filter(Boolean).join(" ")}>
    <div class={styles.mask} onClick={props.onClose} />
    <aside
      class={styles.aside}
      style={{
        "--w": typeof props.width === "number" ? `${props.width}px` : (props.width || 250),
        ...(props.style || {}),
      }}
    >
      <div class={styles.scrollArea}>{props.children}</div>
    </aside>
  </div>
);