import React from 'react';

/**
 * Flutter 风格 Padding
 * 职责：仅负责内边距包裹，不强制改变子元素的块级/行内属性
 */
export const Padding = ({ 
  children, 
  value = 16,    // 对应 EdgeInsets.all()
  horizontal,    // 对应 EdgeInsets.symmetric(horizontal: x)
  vertical,      // 对应 EdgeInsets.symmetric(vertical: x)
  style 
}) => {
  // 优先级逻辑：如果设置了 horizontal/vertical，则覆盖通用 value
  const paddingTop = vertical !== undefined ? vertical : value;
  const paddingBottom = vertical !== undefined ? vertical : value;
  const paddingLeft = horizontal !== undefined ? horizontal : value;
  const paddingRight = horizontal !== undefined ? horizontal : value;

  const paddingStyle = {
    // 处理数值转 px
    paddingTop: typeof paddingTop === 'number' ? `${paddingTop}px` : paddingTop,
    paddingBottom: typeof paddingBottom === 'number' ? `${paddingBottom}px` : paddingBottom,
    paddingLeft: typeof paddingLeft === 'number' ? `${paddingLeft}px` : paddingLeft,
    paddingRight: typeof paddingRight === 'number' ? `${paddingRight}px` : paddingRight,
    
    boxSizing: 'border-box',
    
    // 关键优化：不再强制 width: 100%，而是让它跟随内容
    display: 'contents', // 这是一个高级属性，让 Padding 容器在布局上“隐形”，只留边距效果
    ...style
  };

  // 如果浏览器不支持 display: contents，回退到 inline-block 或 block
  // 但为了稳定，我们通常直接作用于一个 div
  return <div style={{ ...paddingStyle, display: 'block' }}>{children}</div>;
};