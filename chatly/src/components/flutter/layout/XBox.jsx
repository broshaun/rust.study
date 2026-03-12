import React from 'react';
import styles from './XBox.module.css';

const toUnit = (v) => (typeof v === 'number' ? `${v}px` : v);

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
 * 示例
 *
 * <XBox.Segment span={1} align="right">
 *   <Icon name="more"/>
 * </XBox.Segment>
 */
const Segment = ({
  children,
  span = 1,
  padding = 0,
  align = 'center',
  vertical = 'middle',
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
    '--xb-seg-pad': toUnit(padding),
    '--xb-seg-align': alignMap[align] || align,
    '--xb-seg-vertical': verticalMap[vertical] || vertical,
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
    '--xb-w': toUnit(width),
    '--xb-gap': toUnit(gap),
    '--xb-pad': toUnit(padding),
    '--xb-align': alignMap[align] || align,
    '--xb-justify': justifyMap[justify] || justify,
    '--xb-wrap': wrap ? 'wrap' : 'nowrap',
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