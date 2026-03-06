import React from 'react';

/**
 * 内部通用样式生成器
 * 职责：负责定位和留白，确保组件边缘（阴影/缩放）不被裁切
 */
const getBaseStyle = (alignment, horizontal, height, style) => {
  const verticalMap = {
    'top':    { justifyContent: 'flex-start' },
    'center': { justifyContent: 'center' },
    'bottom': { justifyContent: 'flex-end' },
  };

  const horizontalMap = {
    'left':   { alignItems: 'flex-start', textAlign: 'left' },
    'center': { alignItems: 'center', textAlign: 'center' },
    'right':  { alignItems: 'flex-end', textAlign: 'right' },
  };

  return {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: height || 'auto', 
    boxSizing: 'border-box',
    
    // 1. 材质层级保护：允许阴影、高光、缩放动画（如 Button:active）正常溢出
    overflow: 'visible', 
    position: 'relative',
    
    // 2. 缓冲间距：避免内容紧贴物理屏幕边缘，提升视觉呼吸感
    padding: '4px', 

    // 3. 字体渲染优化：确保文字在复杂皮肤背景下清晰
    color: 'var(--text-primary)',
    WebkitFontSmoothing: 'antialiased',

    ...(verticalMap[alignment] || verticalMap.center),
    ...(horizontalMap[horizontal]),
    ...style
  };
};

/**
 * Left / Center / Right 组件实现
 */
export const Left = ({ children, alignment = 'center', height, style }) => (
  <div style={getBaseStyle(alignment, 'left', height, style)}>{children}</div>
);

export const Center = ({ children, alignment = 'center', height, style }) => (
  <div style={getBaseStyle(alignment, 'center', height, style)}>{children}</div>
);

export const Right = ({ children, alignment = 'center', height, style }) => (
  <div style={getBaseStyle(alignment, 'right', height, style)}>{children}</div>
);