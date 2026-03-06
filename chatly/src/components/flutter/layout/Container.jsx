import React from 'react';
import styles from './Container.module.css';

/**
 * Container - 万能材质容器
 * 职责：作为皮肤材质的物理载体，支持 Flutter 式的 BoxDecoration。
 */
const Container = ({
  children,
  width,
  height,
  padding,      
  color,        
  decoration,   
  style,
  onClick
}) => {
  const isClickable = !!onClick;

  const baseStyle = {
    width: typeof width === 'number' ? `${width}px` : width || '100%',
    height: typeof height === 'number' ? `${height}px` : height || 'auto',
    padding: typeof padding === 'number' ? `${padding}px` : padding,
    boxSizing: 'border-box',
    
    // --- 皮肤自适应逻辑 ---
    // 如果没有指定 color，则尝试接入皮肤的面板变量
    backgroundColor: color || decoration?.color || 'transparent',
    borderRadius: decoration?.borderRadius ? 
      (typeof decoration.borderRadius === 'number' ? `${decoration.borderRadius}px` : decoration.borderRadius) 
      : '0px',
    
    // 如果 decoration 没传 border/shadow，默认不显示（或由外部 style 决定）
    border: decoration?.border,
    boxShadow: decoration?.boxShadow,
    
    // 材质核心：如果需要毛玻璃感，可通过 style 或全局变量开启
    backdropFilter: decoration?.blur ? `blur(${decoration.blur}px)` : 'none',
    
    display: 'block',
    flexShrink: 0,
    overflow: 'visible', // 允许阴影溢出
    ...style
  };

  return (
    <div 
      className={`${styles.container} ${isClickable ? styles.clickable : ''}`} 
      style={baseStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Container;