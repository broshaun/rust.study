import React from 'react';
import styles from './AppBar.module.css';
import { Icon } from '../base/Icon';

/**
 * 工业级全主题适配 AppBar
 * 职责：继承主题变量，提供一致的导航交互。
 */
export const AppBar = ({ title, leading, actions, onLeadingClick, style }) => (
  <div className={styles.appBar} style={style}>
    {/* 左侧：返回或菜单 */}
    <div className={styles.leading}>
      {leading && (
        <button className={styles.iconBtn} onClick={onLeadingClick}>
          {typeof leading === 'string' ? <Icon name={leading} size={24} /> : leading}
        </button>
      )}
    </div>

    {/* 中间：标题 (自动适配颜色) */}
    <div className={styles.title}>{title}</div>

    {/* 右侧：功能按钮 */}
    <div className={styles.actions}>
      {actions}
    </div>
  </div>
);