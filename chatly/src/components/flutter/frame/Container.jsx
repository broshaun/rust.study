import React from 'react';
import styles from './Container.module.css';

/**
 * Container - 骨架支撑容器
 * 职责：锁定物理空间，为内部组件（如 ListView）提供稳定的视口。
 */
export const Container = ({ 
  children, 
  verticalScroll = false, 
  horizontalScroll = false, 
  width, 
  height,
  padding,
  margin
}) => {
  const f = (v) => typeof v === 'number' ? `${v}px` : v;

  const vars = {
    '--c-w': f(width),
    '--c-h': f(height),
    '--c-p': f(padding),
    '--c-m': f(margin),
  };

  return (
    <div 
      className={styles.container}
      style={vars}
      data-v={verticalScroll}
      data-h={horizontalScroll}
    >
      {children}
    </div>
  );
};