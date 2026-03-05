import React from 'react';
import styles from './Container.module.css';

/**
 * 纯血版 Container - 职责：装饰（Decoration）+ 尺寸（Size）
 */
const Container = ({
  children,
  width,
  height,
  padding,      // 对应 Flutter Container 内部的 padding
  color,        // 背景色简写
  decoration,   // 复杂装饰
  style,
  onClick
}) => {
  const baseStyle = {
    // 尺寸职责
    width: typeof width === 'number' ? `${width}px` : width || '100%',
    height: typeof height === 'number' ? `${height}px` : height || 'auto',
    
    // 内部间距职责 (EdgeInsets.all)
    padding: typeof padding === 'number' ? `${padding}px` : padding,
    
    // 盒模型规范：强制 border-box 解决贴边问题
    boxSizing: 'border-box',
    
    // 视觉装饰职责 (BoxDecoration)
    backgroundColor: decoration?.color || color || 'transparent',
    borderRadius: decoration?.borderRadius ? `${decoration.borderRadius}px` : '0px',
    border: decoration?.border,
    boxShadow: decoration?.boxShadow,
    
    display: 'block',
    flexShrink: 0,
    ...style
  };

  return (
    <div 
      className={styles.container} 
      style={baseStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Container;