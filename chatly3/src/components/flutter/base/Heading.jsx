import React from 'react';
import styles from './Heading.module.css';

/**
 * Heading - 语义化主题标题
 * 职责：提供 H1-H4 的字阶支持，并自动适配全局主题变量。
 * * @param {Object} props
 * @param {number} [props.level=2] - 标题等级 1-4
 * @param {boolean} [props.tight=false] - 是否开启紧凑行高
 * @param {string} [props.color] - 自定义颜色变量（如 var(--accent-color)）
 */
export const Heading = ({ 
  children, 
  level = 2, 
  tight = false, 
  color,
  style, 
  className = "",
  ...props 
}) => {
  // 确保 level 在 1-4 范围内
  const safeLevel = Math.min(Math.max(level, 1), 4);
  const Tag = `h${safeLevel}`;

  const vars = {
    '--h-color': color,
    '--h-lh': tight ? 1.1 : undefined,
    ...style
  };

  return (
    <Tag
      className={`${styles.heading} ${styles[`h${safeLevel}`]} ${className}`}
      style={vars}
      {...props}
    >
      {children}
    </Tag>
  );
};