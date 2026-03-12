import React, { forwardRef } from 'react';
import styles from './YBox.module.css';

const toUnit = (v) => {
  if (v == null || v === '') return undefined;
  return typeof v === 'number' ? `${v}px` : v;
};

/**
 * YBox - 纯纵向布局容器
 *
 * 特点：
 * 1. 不再需要 Segment
 * 2. 默认不影响子元素宽度
 * 3. 支持 verticalScroll
 * 4. 支持 ref
 * 5. 只负责纵向排列，不负责子项皮肤
 */
export const YBox = forwardRef(({
  children,
  height,
  width = '100%',
  gap = 0,
  padding = 0,
  justify = 'top',
  verticalScroll = false,
  style,
  className = ''
}, ref) => {
  const justifyMap = {
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end',
    between: 'space-between'
  };

  const vars = {
    '--yb-h': toUnit(height) || 'auto',
    '--yb-w': toUnit(width) || '100%',
    '--yb-gap': toUnit(gap) || '0px',
    '--yb-pad': toUnit(padding) || '0px',
    '--yb-justify': justifyMap[justify] || justify,
    ...style
  };

  return (
    <div
      ref={ref}
      className={[styles.ybox, className].filter(Boolean).join(' ')}
      style={vars}
      data-scroll={verticalScroll}
    >
      {children}
    </div>
  );
});

export default YBox;