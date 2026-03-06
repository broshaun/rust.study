import React from 'react';

/**
 * Heading - 万能风格标题组件
 * 职责：锁定“单行截断”骨架，动态接入全局皮肤变量。
 */
export const Heading = ({ level = 2, children, style, onClick }) => {
  const sizeMap = { 1: '26px', 2: '22px', 3: '18px', 4: '16px' };
  const Tag = `h${level}`;

  const baseStyle = {
    // 1. 字体骨架
    fontSize: sizeMap[level],
    fontWeight: level <= 2 ? 700 : 600,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
    
    // 2. 皮肤应用 (由 theme.css 驱动)
    backgroundColor: 'var(--panel-bg)',
    backdropFilter: 'var(--panel-blur)',
    WebkitBackdropFilter: 'var(--panel-blur)', // 兼容 Safari
    border: 'var(--panel-border)',
    boxShadow: 'var(--panel-shadow)',
    
    // 3. 布局骨架 (锁定单行不换行)
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '12px',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxSizing: 'border-box', // 确保 Padding 不会撑大宽度导致截断失效
    
    // 4. 交互增强
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // 切换风格时的丝滑动画
    
    ...style
  };

  return (
    <Tag style={baseStyle} onClick={onClick}>
      {children}
    </Tag>
  );
};