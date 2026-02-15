import React, { memo } from 'react';
import styles from './Row.module.css';

/**
 * Row 行容器组件（核心精简版）
 * @param {React.ReactNode} children - 子元素
 * @param {string|number} gap - 子元素间距，默认 0（数字=px，字符串=自定义单位）
 * @param {string} align - 垂直对齐：start/center/end，默认 center
 * @param {string} justify - 水平对齐：start/center/end/between/around，默认 start
 * @param {boolean} wrap - 是否自动换行，默认 false
 * @param {boolean} fullWidth - 是否占满父容器宽度，默认 false
 * @param {string|number} width - 自定义宽度，默认 auto（数字=px，字符串=自定义单位）
 * @param {string|number} height - 自定义高度，默认 auto（数字=px，字符串=自定义单位）
 */
const Row = memo(({
  children,
  gap = 0,
  align = 'center',
  justify = 'start',
  wrap = false,
  fullWidth = false,
  width = 'auto',
  height = 'auto',
}) => {
  // 处理长宽样式
  const getDimensionStyle = (value, type) => {
    if (value === 'auto') return {};
    return { [type]: typeof value === 'number' ? `${value}px` : value };
  };

  // 合并核心样式（仅保留间距+长宽）
  const mergedStyle = {
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    ...getDimensionStyle(width, 'width'),
    ...getDimensionStyle(height, 'height'),
  };

  // 合并类名（仅核心布局类）
  const rowClasses = [
    styles.row,
    (fullWidth && width === 'auto') && styles.fullWidth,
    styles[`align-${align}`],
    styles[`justify-${justify}`],
    wrap ? styles.wrap : styles.nowrap,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={rowClasses}
      style={mergedStyle}
    >
      {children}
    </div>
  );
});

export default Row;