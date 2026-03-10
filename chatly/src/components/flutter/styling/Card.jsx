import React from 'react';
import styles from './Card.module.css';

/**
 * Card - 自动高度适配卡片组件
 * @param {ReactNode} children - 卡片内容
 * @param {string | number} width - 卡片宽度（默认 100%）
 * @param {string | number} padding - 内边距（默认 16px）
 * @param {Function} onClick - 点击事件回调
 */
export const Card = ({
  children,
  width,
  padding = 0,
  onClick,
  style,
  ...rest // 保持开放，支持传入 id, data-* 等原生属性
}) => {
  const f = (v) => typeof v === 'number' ? `${v}px` : v;

  // 使用 CSS 变量管理动态尺寸，避免频繁的内联 style 重绘
  const customStyle = {
    ...(width !== undefined && { '--card-w': f(width) }),
    ...(padding !== undefined && { '--card-p': f(padding) }),
    ...style
  };

  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ''}`}
      style={customStyle}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};