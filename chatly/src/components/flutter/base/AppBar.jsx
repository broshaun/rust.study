import React from 'react';
import styles from './AppBar.module.css';
import { IconSvg } from './IconSvg';

/**
 * 极简 AppBar
 * 职责：仅负责顶栏的“左-中-右”三段式内容呈现
 */
export const AppBar = ({ title, leading, actions, onLeadingClick, style }) => (
  <div className={styles.appBar} style={style}>
    {/* 左侧槽位：自适应内容宽度 */}
    <div className={styles.leading}>
      {leading && (
        <button className={styles.iconBtn} onClick={onLeadingClick}>
          {typeof leading === 'string' ? <IconSvg name={leading} size={24} /> : leading}
        </button>
      )}
    </div>

    {/* 中间标题：绝对居中 */}
    <div className={styles.title}>{title}</div>

    {/* 右侧槽位：根据内容自动撑开 */}
    <div className={styles.actions}>
      {actions}
    </div>
  </div>
);