import styles from "./AppBar.module.css";

/**
 * AppBar - 材质适配导航栏
 * 职责：原生实现 Mac 风格布局，确保标题物理居中，且完美适配 7 套主题。
 *
 * @param {Object} props
 * @param {any} props.title
 * @param {any} props.leading
 * @param {any} props.actions
 * @param {object} props.style
 */
export const AppBar = (props) => {
  return (
    <nav class={styles.appBar} style={props.style}>
      {/* 左侧 */}
      <div class={styles.leadingSection}>
        {props.leading}
      </div>

      {/* 中间 */}
      <div class={styles.titleWrapper}>
        <h1 class={styles.titleText}>{props.title}</h1>
      </div>

      {/* 右侧 */}
      <div class={styles.actionsSection}>
        {props.actions}
      </div>
    </nav>
  );
};