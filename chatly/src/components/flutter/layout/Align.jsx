import React from 'react';

/**
 * 精准定位生成器 (保留所有视觉特性版)
 * 优化点：
 * 1. 提取静态映射，减少每次渲染的计算开销。
 * 2. 增强 height 处理，兼容数字和字符串。
 * 3. 明确 Flex 轴向逻辑注释。
 */
const VERTICAL_ALIGN = {
  top:    { justifyContent: 'flex-start' },
  center: { justifyContent: 'center' },
  bottom: { justifyContent: 'flex-end' },
};

const HORIZONTAL_ALIGN = {
  left:   { alignItems: 'flex-start', textAlign: 'left' },
  center: { alignItems: 'center', textAlign: 'center' },
  right:  { alignItems: 'flex-end', textAlign: 'right' },
};

const getBaseStyle = (alignment, horizontal, height, style) => {
  const toUnit = (val) => (typeof val === 'number' ? `${val}px` : val);

  return {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: toUnit(height) || 'auto', 
    boxSizing: 'border-box',
    
    // 允许阴影和 Scale 动画正常溢出（不被截断）
    overflow: 'visible', 
    position: 'relative',
    
    // 保留你习惯的缓冲间距，防止内容贴边
    padding: '4px', 

    // 保留材质渲染优化，确保文字清晰度
    color: 'var(--text-primary)',
    WebkitFontSmoothing: 'antialiased',

    // 混合对齐逻辑
    ...(VERTICAL_ALIGN[alignment] || VERTICAL_ALIGN.center),
    ...(HORIZONTAL_ALIGN[horizontal] || HORIZONTAL_ALIGN.center),
    
    ...style
  };
};

/**
 * Left: 水平靠左，垂直可选 (默认居中)
 */
export const Left = ({ children, alignment = 'center', height, style }) => (
  <div style={getBaseStyle(alignment, 'left', height, style)}>{children}</div>
);

/**
 * Center: 全局居中 (默认水平垂直全居中)
 */
export const Center = ({ children, alignment = 'center', height, style }) => (
  <div style={getBaseStyle(alignment, 'center', height, style)}>{children}</div>
);

/**
 * Right: 水平靠右，垂直可选 (默认居中)
 */
export const Right = ({ children, alignment = 'center', height, style }) => (
  <div style={getBaseStyle(alignment, 'right', height, style)}>{children}</div>
);