import React from 'react';

/**
 * Expanded - 弹性伸缩器
 * 职责：占据 Row 或 Column 中的所有剩余可用空间。
 */
export const Expanded = ({ children, flex = 1, style }) => {
  return (
    <div style={{
      flex: flex,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,  // 关键：防止 Flex 内容溢出导致容器变形
      minHeight: 0, 
      ...style
    }}>
      {children}
    </div>
  );
};