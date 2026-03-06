import React from 'react';

/**
 * SizedBox - 万能布局占位器
 * 职责：提供绝对精确的间距，确保在任何皮肤材质下布局不坍塌。
 */
export const SizedBox = ({ width, height, children, style }) => {
  const boxStyle = {
    // 1. 尺寸锁定
    width: typeof width === 'number' ? `${width}px` : width || (children ? 'auto' : '0px'),
    height: typeof height === 'number' ? `${height}px` : height || (children ? 'auto' : '0px'),
    
    // 2. 布局约束
    display: children ? 'inline-block' : 'block',
    flexShrink: 0, 
    flexGrow: 0,
    
    // 3. 细节修正：消除行内元素的基线对齐导致的细微位移
    verticalAlign: 'middle',
    boxSizing: 'border-box',
    
    // 确保即便是有 children 时，背景逻辑也不会干扰整体皮肤
    backgroundColor: 'transparent',
    ...style
  };

  return <div style={boxStyle}>{children}</div>;
};

export default SizedBox;