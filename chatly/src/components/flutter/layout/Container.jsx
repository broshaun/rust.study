import React, { forwardRef } from 'react';
import styles from './Container.module.css';

/**
 * Container - 主题感知容器
 * 职责：锁定空间、应用主题样式、处理对齐与边距、支持滚动美化。
 */
export const Container = forwardRef(({
  children,
  verticalScroll = false,
  horizontalScroll = false,
  width = '100%',
  height = '100%',
  padding = 0,
  margin = 0,
  align = 'stretch', // 上中下: top, middle, bottom, stretch
  justify = 'center',  // 左中右: left, center, right, between
  className = ''
}, ref) => {
  const f = (v) => typeof v === 'number' ? `${v}px` : v;

  // 语义化对齐映射
  const alignMap = { top: 'flex-start', middle: 'center', bottom: 'flex-end', stretch: 'stretch' };
  const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end', between: 'space-between' };

  const vars = {
    '--cont-w': f(width),
    '--cont-h': f(height),
    '--cont-pad': f(padding),
    '--cont-mar': f(margin),
    '--cont-align': alignMap[align] || align,
    '--cont-justify': justifyMap[justify] || justify,
  };

  return (
    <div
      ref={ref}
      className={`${styles.container} ${className}`}
      style={vars}
      data-v={verticalScroll}
      data-h={horizontalScroll}
    >
      {children}
    </div>
  );
});