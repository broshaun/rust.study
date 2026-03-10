import React from 'react';

/**
 * DecoratedBox - 风格框架组件
 * 职责：装饰性视觉表现（边框、投影、毛玻璃）。
 * 自动适配：默认读取主题变量。
 */
export const DecoratedBox = ({
  children,
  showBorder = true,
  showShadow = false,
  blur = false,
  borderRadius,
  style
}) => {
  const boxStyle = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',

    // 1. 边框：逻辑开关
    border: showBorder ? 'var(--panel-border)' : 'none',

    // 2. 圆角：读取全局或自定义
    borderRadius: borderRadius || 'var(--radius-main, 12px)',

    // 3. 投影：逻辑开关
    boxShadow: showShadow ? 'var(--panel-shadow)' : 'none',

    // 4. 毛玻璃：逻辑开关
    backdropFilter: blur ? 'var(--panel-blur)' : 'none',
    WebkitBackdropFilter: blur ? 'var(--panel-blur)' : 'none',

    // 确保内容不溢出圆角
    overflow: 'hidden',

    ...style
  };

  return <div style={boxStyle}>{children}</div>;
};