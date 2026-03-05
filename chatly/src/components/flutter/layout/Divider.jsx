import React from 'react';

/**
 * Flutter 风格 Divider 组件
 * @param {number} height - 容器总高度（包含边距）
 * @param {number} thickness - 线条本身的粗细
 * @param {string} color - 线条颜色
 * @param {number} indent - 左侧缩进
 * @param {number} endIndent - 右侧缩进
 */
export const Divider = ({ 
  height = 16, 
  thickness = 1, 
  color = '#e0e0e0', 
  indent = 0, 
  endIndent = 0 
}) => {
  const containerStyle = {
    height: `${height}px`,
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  };

  const lineStyle = {
    height: `${thickness}px`,
    backgroundColor: color,
    flex: 1,
    marginLeft: `${indent}px`,
    marginRight: `${endIndent}px`
  };

  return (
    <div style={containerStyle}>
      <div style={lineStyle} />
    </div>
  );
};