import React from 'react';

/**
 * Padding - 纯净布局组件
 * 职责：只负责空间占位。
 */
export const Padding = ({ children, value = 0, horizontal, vertical, style }) => {
  const toUnit = (val) => (typeof val === 'number' ? `${val}px` : val);
  
  const pt = vertical !== undefined ? vertical : value;
  const pl = horizontal !== undefined ? horizontal : value;

  return (
    <div style={{
      paddingTop: toUnit(pt),
      paddingBottom: toUnit(vertical !== undefined ? vertical : value),
      paddingLeft: toUnit(pl),
      paddingRight: toUnit(horizontal !== undefined ? horizontal : value),
      display: 'block',
      boxSizing: 'border-box',
      ...style
    }}>
      {children}
    </div>
  );
};