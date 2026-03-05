import React from 'react';

/**
 * Flutter 风格 Padding
 * @param {number|string} value - 对应 EdgeInsets.all()
 */
export const Padding = ({ children, value = 16, style }) => {
  const paddingStyle = {
    padding: typeof value === 'number' ? `${value}px` : value,
    boxSizing: 'border-box', // 关键：确保宽度包含 padding
    width: '100%',
    display: 'block',
    ...style
  };

  return <div style={paddingStyle}>{children}</div>;
};