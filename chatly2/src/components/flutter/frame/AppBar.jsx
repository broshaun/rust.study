import React from "react";
import styles from "./AppBar.module.css";

/**
 * AppBar - 通用主题适配导航栏
 * 规则：
 * 1. 只使用全局通用主题变量
 * 2. 保持标题物理居中
 * 3. 左右区域自适应，避免标题受内容偏移
 * 4. 兼容 7 套主题，不写组件专属主题变量
 */
export const AppBar = ({
  title,
  leading,
  actions,
  style,
  className = "",
}) => {
  return (
    <nav className={`${styles.appBar} ${className}`} style={style}>
      <div className={styles.leadingSection}>{leading}</div>

      <div className={styles.titleWrapper}>
        <h1 className={styles.titleText} title={typeof title === "string" ? title : undefined}>
          {title}
        </h1>
      </div>

      <div className={styles.actionsSection}>{actions}</div>
    </nav>
  );
};