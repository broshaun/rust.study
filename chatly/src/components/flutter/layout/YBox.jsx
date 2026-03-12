import React, { forwardRef } from 'react';
import styles from './YBox.module.css';

const toUnit = (v) => {
  if (v == null || v === '') return undefined;
  return typeof v === 'number' ? `${v}px` : v;
};

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
    '--yb-h': height == null ? 'auto' : toUnit(height),
    '--yb-w': width == null ? '100%' : toUnit(width),
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
      data-scroll={verticalScroll ? 'true' : 'false'}
    >
      {children}
    </div>
  );
});

export default YBox;