import React from 'react';
import styles from './XBox.module.css';

const toUnit = (v) => {
  if (v == null || v === '') return undefined;
  return typeof v === 'number' ? `${v}px` : v;
};

/**
 * XBox.Segment - 横向分区
 *
 * 用于在 XBox 中按比例分配空间，并控制内容对齐。
 *
 * Props
 * @param {number} span
 *   占比权重，例如 1 : 2 : 1
 *
 * @param {number|string} padding
 *   内边距
 *
 * @param {'left'|'center'|'right'} align
 *   内容水平对齐
 *
 * @param {'top'|'middle'|'bottom'|'stretch'} vertical
 *   内容垂直对齐
 *
 * @param {boolean} divider
 *   是否显示右侧分割线
 *
 * @param {string} dividerColor
 *   分割线颜色，默认跟随主题
 */
const Segment = ({
  children,
  span = 1,
  padding = 0,
  align = 'center',
  vertical = 'middle',
  divider = false,
  dividerColor,
  style
}) => {
  const alignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end'
  };

  const verticalMap = {
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end',
    stretch: 'stretch'
  };

  const vars = {
    '--xb-seg-span': span,
    '--xb-seg-pad': toUnit(padding) || '0px',
    '--xb-seg-align': alignMap[align] || align,
    '--xb-seg-vertical': verticalMap[vertical] || vertical,
    '--xb-seg-divider-width': divider ? '1px' : '0px',
    '--xb-seg-divider-color': dividerColor || 'var(--xb-divider-color, rgba(var(--text-primary-rgb, 0, 0, 0), 0.12))',
    ...style
  };

  return (
    <div className={styles.segment} style={vars}>
      {children}
    </div>
  );
};

/**
 * XBox - 横向比例布局容器
 *
 * 类似 Flutter Row + Expanded。
 *
 * Props
 * @param {number|string} height
 * @param {number|string} width
 * @param {number|string} gap
 * @param {number|string} padding
 * @param {'top'|'middle'|'bottom'|'stretch'} align
 * @param {'left'|'center'|'right'|'between'} justify
 * @param {boolean} wrap
 *
 * @param {boolean} border
 *   是否显示边框
 *
 * @param {string} borderColor
 *   边框颜色，默认跟随主题
 *
 * @param {number|string} borderWidth
 *   边框宽度
 *
 * @param {number|string} radius
 *   圆角，默认跟随主题
 *
 * @param {boolean} panel
 *   是否启用主题面板风格（panel-bg / panel-border / panel-shadow / panel-blur）
 *
 * @param {string} background
 *   自定义背景，默认跟随主题
 *
 * @param {string} shadow
 *   自定义阴影，默认跟随主题
 *
 * @param {boolean} clip
 *   是否裁剪圆角内容
 */
export const XBox = ({
  children,
  height,
  width = '100%',
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

  style
}) => {
  const alignMap = {
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end',
    stretch: 'stretch'
  };

  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    between: 'space-between'
  };

  const vars = {
    '--xb-h': height == null ? 'auto' : toUnit(height),
    '--xb-w': toUnit(width) || '100%',
    '--xb-gap': toUnit(gap) || '0px',
    '--xb-pad': toUnit(padding) || '0px',
    '--xb-align': alignMap[align] || align,
    '--xb-justify': justifyMap[justify] || justify,
    '--xb-wrap': wrap ? 'wrap' : 'nowrap',

    '--xb-border-width': border ? (toUnit(borderWidth) || '1px') : '0px',
    '--xb-border-color':
      borderColor || 'var(--panel-border-color, rgba(var(--text-primary-rgb, 0, 0, 0), 0.12))',
    '--xb-radius': toUnit(radius) || 'var(--radius-main, 16px)',

    '--xb-bg': background || (panel ? 'var(--panel-bg, transparent)' : 'transparent'),
    '--xb-shadow': shadow || (panel ? 'var(--panel-shadow, none)' : 'none'),
    '--xb-backdrop': panel ? 'var(--panel-blur, blur(0px))' : 'blur(0px)',
    '--xb-divider-color': 'rgba(var(--text-primary-rgb, 0, 0, 0), 0.12)',
    '--xb-text-color': 'var(--text-primary, inherit)',
    '--xb-overflow': clip ? 'hidden' : 'visible',

    ...style
  };

  return (
    <div className={styles.xbox} style={vars}>
      {children}
    </div>
  );
};

XBox.Segment = Segment;

export default XBox;