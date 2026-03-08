import React from 'react';
import styles from './Column.module.css';

/**
 * Column - 纯净布局版
 * 职责：仅作为垂直轨道，确保子元素纵向排列。
 */
export const Column = ({ children, height, className = '', style }) => {
  return (
    <div 
      className={`${styles.column} ${className}`} 
      style={{
        height: typeof height === 'number' ? `${height}px` : height || 'auto',
        // 移除风格相关属性：不再干涉文字颜色和过渡动画
        ...style
      }}
    >
      {children}
    </div>
  );
};