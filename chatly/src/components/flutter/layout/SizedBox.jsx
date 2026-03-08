import React from 'react';

/**
 * SizedBox - 布局空间调节器
 * 职责：强制产生固定尺寸的间隙，或作为容器约束子元素尺寸。
 */
export const SizedBox = ({ children, width, height, style }) => {
  const toUnit = (val) => (typeof val === 'number' ? `${val}px` : val);
  
  return (
    <div style={{
      width: toUnit(width) || (children ? 'auto' : '0px'),
      height: toUnit(height) || (children ? 'auto' : '0px'),
      display: children ? 'block' : 'inline-block',
      flexShrink: 0, // 防止在 Row/Column 中被挤压
      ...style
    }}>
      {children}
    </div>
  );
};