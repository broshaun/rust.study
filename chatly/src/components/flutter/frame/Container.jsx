import React, { forwardRef } from 'react';
import styles from './Container.module.css';

/**
 * Container - 骨架支撑容器
 * 核心职责：锁定物理空间，支持 forwardRef 绑定。
 */
export const Container = forwardRef(({
  children,
  verticalScroll = false,
  horizontalScroll = false,
  width = '100%',
  height = '100%'
}, ref) => {
  // 简单的尺寸转换逻辑
  const toSize = (v) => typeof v === 'number' ? `${v}px` : v;

  return (
    <div
      ref={ref}
      className={styles.container}
      style={{ width: toSize(width), height: toSize(height) }}
      data-v={verticalScroll}
      data-h={horizontalScroll}
    >
      {children}
    </div>
  );
});