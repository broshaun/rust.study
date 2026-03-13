import React, { forwardRef, Children, isValidElement } from 'react';
import styles from './XBox.module.css';

const toUnit = (v) => {
  if (v == null || v === '') return undefined;
  return typeof v === 'number' ? `${v}px` : v;
};

const alignMap = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
  stretch: 'stretch',
};

const justifyMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
  between: 'space-between',
};

/**
 * XBox.Segment
 * 横向分区项
 *
 * 作用：
 * 1. 按 span 比例分配宽度
 * 2. 可覆盖父级的水平 / 垂直对齐
 * 3. 支持内边距和右分割线
 */
const Segment = ({
  children,
  span = 1,
  padding = 0,
  align,
  vertical,
  divider = false,
  dividerColor,
  className = '',
  style,
}) => {
  const segStyle = {
    '--xb-seg-span': span,
    '--xb-seg-pad': toUnit(padding) || '0px',
    '--xb-seg-align': align ? (justifyMap[align] || align) : 'var(--xb-seg-align-default)',
    '--xb-seg-vertical': vertical ? (alignMap[vertical] || vertical) : 'var(--xb-seg-vertical-default)',
    '--xb-seg-divider-width': divider ? '1px' : '0px',
    '--xb-seg-divider-color':
      dividerColor ||
      'var(--xb-divider-color, rgba(var(--text-primary-rgb, 0, 0, 0), 0.12))',
    ...style,
  };

  return (
    <div
      className={[styles.segment, className].filter(Boolean).join(' ')}
      style={segStyle}
    >
      {children}
    </div>
  );
};

Segment.__XBOX_SEGMENT__ = true;

/**
 * XBox
 * 横向流 / 横向分区容器
 */
export const XBox = forwardRef(({
  children,
  width = '100%',
  height,
  gap = 0,
  padding = 0,
  align = 'middle',
  justify = 'center',
  wrap = false,

  border = false,
  borderColor,
  borderWidth = 1,
  radius,

  panel = false,
  background,
  shadow,
  clip = false,

  className = '',
  style,
}, ref) => {
  const vars = {
    '--xb-w': toUnit(width) || '100%',
    '--xb-h': toUnit(height) || 'auto',
    '--xb-gap': toUnit(gap) || '0px',
    '--xb-pad': toUnit(padding) || '0px',
    '--xb-align': alignMap[align] || align,
    '--xb-justify': justifyMap[justify] || justify,
    '--xb-wrap': wrap ? 'wrap' : 'nowrap',

    '--xb-border-width': border ? (toUnit(borderWidth) || '1px') : '0px',
    '--xb-border-color':
      borderColor ||
      'var(--panel-border-color, rgba(var(--text-primary-rgb, 0, 0, 0), 0.12))',
    '--xb-radius': toUnit(radius) || 'var(--radius-main, 16px)',

    '--xb-bg': background || (panel ? 'var(--panel-bg, transparent)' : 'transparent'),
    '--xb-shadow': shadow || (panel ? 'var(--panel-shadow, none)' : 'none'),
    '--xb-backdrop': panel ? 'var(--panel-blur, blur(0px))' : 'blur(0px)',
    '--xb-divider-color': 'rgba(var(--text-primary-rgb, 0, 0, 0), 0.12)',
    '--xb-text-color': 'var(--text-primary, inherit)',
    '--xb-overflow': clip ? 'hidden' : 'visible',

    /* Segment 默认继承父级 */
    '--xb-seg-align-default': justifyMap[justify] || justify,
    '--xb-seg-vertical-default': alignMap[align] || align,

    ...style,
  };

  return (
    <div
      ref={ref}
      className={[styles.xbox, className].filter(Boolean).join(' ')}
      style={vars}
    >
      {Children.map(children, (child) => {
        if (child == null) return null;

        if (!isValidElement(child)) {
          return <Segment>{child}</Segment>;
        }

        if (child.type?.__XBOX_SEGMENT__) {
          return child;
        }

        return <Segment>{child}</Segment>;
      })}
    </div>
  );
});

XBox.Segment = Segment;

export default XBox;