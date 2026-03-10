import React from 'react';
import styles from './Padding.module.css';

/**
 * Padding - 纯净布局组件
 * 职责：提供标准的内边距容器。
 * @param {string} size - 间距大小: s(8px), m(16px), l(24px), xl(32px)
 */
export const Padding = ({ children, value = 10 }) => {
  return (
    <div 
      className={styles.paddingBase}
      style={{ '--padding-val': typeof value === 'number' ? `${value}px` : value }}
    >
      {children}
    </div>
  );
};