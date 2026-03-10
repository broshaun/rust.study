import React from 'react';
import styles from './SizedBox.module.css';

/**
 * SizedBox - 纯净空间调节器
 * 职责：严格约束子元素的空间尺寸。
 */
export const SizedBox = ({ children, width, height }) => {
  // 构建 CSS 变量，如果是数字则默认为 px
  const vars = {
    '--sb-width': typeof width === 'number' ? `${width}px` : width,
    '--sb-height': typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={children ? styles.sizedBoxWithContent : styles.sizedBoxEmpty}
      style={vars}
    >
      {children}
    </div>
  );
};