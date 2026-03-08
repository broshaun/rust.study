import React from 'react';

/**
 * Center - 纯净布局版
 * 职责：强制子组件在可用空间内水平、垂直双向居中。
 */
export const Center = ({ children, height, style }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: height || 'auto', 
      justifyContent: 'center', // 垂直居中
      alignItems: 'center',     // 水平居中
      overflow: 'visible',      // 允许子组件阴影溢出
      ...style
    }}>
      {children}
    </div>
  );
};