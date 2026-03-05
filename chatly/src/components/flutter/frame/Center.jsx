import React from 'react';

/**
 * Flutter 风格 Center
 * 职责：仅负责定位。内部默认纵向排列，防止内容堆叠在一行。
 */
export const Center = ({ children, mode = 'all', height = '100%', style }) => {
  const getAlignment = () => {
    switch (mode) {
      case 'horizontal':
        // 水平居中，垂直靠顶
        return { justifyContent: 'center', alignItems: 'flex-start' };
      case 'vertical':
        // 垂直居中，水平靠左
        return { justifyContent: 'flex-start', alignItems: 'center' };
      case 'all':
      default:
        // 全居中
        return { justifyContent: 'center', alignItems: 'center' };
    }
  };

  const centerStyle = {
    display: 'flex',
    flexDirection: 'column', // 核心修正：强制纵向排列，解决“堆成一行”的问题
    width: '100%',
    height: height,
    boxSizing: 'border-box',
    ...getAlignment(),
    ...style
  };

  return <div style={centerStyle}>{children}</div>;
};