import React from "react";

/**
 * Text - 智能风格适配文本
 * 支持基础文本和 Label-Value 模式
 */
export const Text = ({
  children,
  label,              // 新增：左侧标签内容
  labelWidth = 60,    // 标签固定宽度，确保纵向对齐
  size = 14,
  weight = 'normal',
  color = 'var(--text-primary)',
  align = 'left',
  style,
  ...props
}) => {
  
  // 基础样式：跟随主题变量
  const baseStyle = {
    fontSize: typeof size === 'number' ? `${size}px` : size,
    fontWeight: weight,
    color: color,
    textAlign: align,
    lineHeight: 1.5,
    transition: 'all var(--transition-speed, 0.3s) ease', // 适配主题切换动画
    ...style
  };

  // 模式 A：带 Label 的展示模式
  if (label) {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', width: '100%' }}>
        {/* 标签部分：自动适配次要文字风格 */}
        <span style={{ 
          width: `${labelWidth}px`, 
          flexShrink: 0,
          fontSize: '13px', 
          color: 'var(--text-secondary)',
          opacity: 0.7 
        }}>
          {label}
        </span>
        
        {/* 内容部分：适配主要文字风格 */}
        <span style={baseStyle} {...props}>
          {children || '-'}
        </span>
      </div>
    );
  }

  // 模式 B：纯文本模式
  return (
    <span style={baseStyle} {...props}>
      {children}
    </span>
  );
};