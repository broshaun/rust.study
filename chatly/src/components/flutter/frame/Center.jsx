import React from 'react';

/**
 * Flutter 风格 Center 组件 (React 版)
 * 作用：将其内部所有元素在水平和垂直方向上完美居中
 */
export const Center = ({ children, height = '100%', width = '100%', style }) => {
  const centerStyle = {
    display: 'flex',
    flexDirection: 'column', // 默认列方向，方便多个 Row 堆叠
    alignItems: 'center',     // 水平居中
    justifyContent: 'center', // 垂直居中
    width: width,
    height: height,
    boxSizing: 'border-box',
    ...style
  };

  return (
    <div style={centerStyle}>
      {children}
    </div>
  );
};