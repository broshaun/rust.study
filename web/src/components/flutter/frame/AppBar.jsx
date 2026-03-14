import React from 'react';
import styles from './AppBar.module.css';

/**
 * AppBar - 材质适配导航栏
 * 职责：原生实现 Mac 风格布局，确保标题物理居中，且完美适配 7 套主题。
 * * @param {Object} props
 * @param {React.ReactNode} props.title - 标题内容
 * @param {React.ReactNode} props.leading - 左侧内容（如返回按钮、Mac 红绿灯避让）
 * @param {React.ReactNode} props.actions - 右侧内容（如功能图标）
 * @param {React.CSSProperties} props.style - 自定义覆盖样式
 */
export const AppBar = ({ title, leading, actions, style }) => {
  return (
    <nav className={styles.appBar} style={style}>
      {/* 左侧：内容靠左排列 */}
      <div className={styles.leadingSection}>
        {leading}
      </div>

      {/* 中间：标题物理绝对居中 */}
      <div className={styles.titleWrapper}>
        <h1 className={styles.titleText}>{title}</h1>
      </div>

      {/* 右侧：动作区靠右排列 */}
      <div className={styles.actionsSection}>
        {actions}
      </div>
    </nav>
  );
};