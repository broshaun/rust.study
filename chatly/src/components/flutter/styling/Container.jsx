import React from 'react';
import styles from './Container.module.css';

/**
 * Container - 万能材质容器 (体系化风格版)
 * 职责：作为皮肤材质的物理载体，统一管理背景、圆角、材质滤镜。
 * 默认状态：无边框、无阴影，完全透明，仅作为内容容器。
 */
const Container = ({
  children,
  width,
  height,
  padding,      
  color,        
  decoration,   
  style,
  onClick,
  className = ""
}) => {
  const isClickable = !!onClick;
  const toUnit = (val) => (typeof val === 'number' ? `${val}px` : val);

  const baseStyle = {
    // 1. 基础布局属性
    width: toUnit(width) || (style?.width ? undefined : '100%'),
    height: toUnit(height) || 'auto',
    padding: toUnit(padding), 
    boxSizing: 'border-box',
    display: 'block',
    flexShrink: 0,
    overflow: 'visible', // 允许阴影溢出

    // 2. 皮肤材质逻辑 (属性 > decoration > 默认透明)
    // 默认不显示边框和阴影，除非手动传入
    backgroundColor: color || decoration?.color || 'transparent',
    borderRadius: toUnit(decoration?.borderRadius) || '0px',
    border: decoration?.border || 'none', 
    boxShadow: decoration?.boxShadow || 'none',
    
    // 3. 材质增强 (毛玻璃与渲染优化)
    backdropFilter: decoration?.blur ? `blur(${decoration.blur}px)` : 'none',
    WebkitBackdropFilter: decoration?.blur ? `blur(${decoration.blur}px)` : 'none',
    
    // 统一收拢原本在布局组件中的风格逻辑
    color: 'var(--text-primary)',
    WebkitFontSmoothing: 'antialiased', 
    
    ...style
  };

  return (
    <div 
      className={`${styles.container} ${isClickable ? styles.clickable : ''} ${className}`} 
      style={baseStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Container;