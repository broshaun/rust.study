import React from 'react';
import styles from './AppBar.module.css';
import { Icon } from '../base/Icon';

/**
 * 精准适配版 AppBar
 * 职责：避让红绿灯的同时，保持图标与标题的视觉平衡。
 */
export const AppBar = ({ title, leading, actions, onLeadingClick, style }) => (
  <nav className={styles.appBar} style={style}>
    {/* 左侧区域：已通过 CSS margin-left 避开 Mac 红绿灯 */}
    <div className={styles.leading}>
      {leading && (
        <button 
          className={styles.iconBtn} 
          onClick={onLeadingClick}
          aria-label="Toggle Drawer"
        >
          {typeof leading === 'string' ? <Icon name={leading} size={22} /> : leading}
        </button>
      )}
    </div>

    {/* 中间：标题锁定物理居中 */}
    <h1 className={styles.title}>{title}</h1>

    {/* 右侧：动作按钮 */}
    <div className={styles.actions}>
      {actions}
    </div>
  </nav>
);