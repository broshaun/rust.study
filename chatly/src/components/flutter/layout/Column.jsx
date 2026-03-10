import React from 'react';
import styles from './Column.module.css';

/**
 * Column - 直觉垂直轨道
 * 职责：强制子元素垂直排列。默认横向占满父级，提供充足的对齐空间。
 * @param {number|string} width - 轨道宽度，默认 100%
 */
export const Column = ({ children, width = '100%' }) => {
  // 尺寸单位自动补全：如果是数字自动加 px，否则保留原样（如 '100%', 'auto'）
  const f = (v) => typeof v === 'number' ? `${v}px` : v;
  
  return (
    <div 
      className={styles.column} 
      style={{ '--col-w': f(width) }}
    >
      {children}
    </div>
  );
};