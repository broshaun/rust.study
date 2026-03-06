import React from 'react';
import styles from './AppBar.module.css';
import { IconSvg } from '../base/IconSvg';

/**
 * 手机端适配版 AppBar
 * 职责：绝对居中的标题，标准化的热区反馈，适配 Scaffold 材质。
 */
export const AppBar = ({ title, leading, actions, onLeadingClick, style }) => (
  <div className={styles.appBar} style={style}>
    {/* 左侧槽位 */}
    <div className={styles.leading}>
      {leading && (
        <button className={styles.iconBtn} onClick={onLeadingClick}>
          {typeof leading === 'string' ? <IconSvg name={leading} size={24} /> : leading}
        </button>
      )}
    </div>

    {/* 中间标题：始终基于外部容器绝对居中 */}
    <div className={styles.title}>{title}</div>

    {/* 右侧槽位 */}
    <div className={styles.actions}>
      {actions}
    </div>
  </div>
);