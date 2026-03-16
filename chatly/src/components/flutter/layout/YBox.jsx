import React, { forwardRef, Children, isValidElement } from 'react';
import styles from './YBox.module.css';

const toUnit = (v) => {
  if (v == null || v === '') return undefined;
  return typeof v === 'number' ? `${v}px` : v;
};

const alignMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
  stretch: 'stretch',
};

const justifyMap = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
  between: 'space-between',
};

/**
 * YBox.Segment
 * 单个纵向区块
 * 用于覆盖父级的横向对齐，或隔离某一段样式
 */
const Segment = ({
  children,
  align,
  width,
  className = '',
  style,
}) => {
  const segmentStyle = {
    alignSelf: align ? (alignMap[align] || align) : 'var(--yb-align)',
    width: width != null ? toUnit(width) : undefined,
    ...style,
  };

  return (
    <div
      className={[styles.segment, className].filter(Boolean).join(' ')}
      style={segmentStyle}
    >
      {children}
    </div>
  );
};

Segment.__YBOX_SEGMENT__ = true;

/**
 * YBox
 * 纵向内容流容器
 */
export const YBox = forwardRef(({
  children,
  width = '100%',
  height,
  gap = 0,
  padding = 0,
  align = 'stretch',
  justify = 'top',
  scroll = false,
  className = '',
  style,
}, ref) => {
  const vars = {
    '--yb-w': toUnit(width) || '100%',
    '--yb-h': toUnit(height) || 'auto',
    '--yb-gap': toUnit(gap) || '0px',
    '--yb-pad': toUnit(padding) || '0px',
    '--yb-align': alignMap[align] || align,
    '--yb-justify': justifyMap[justify] || justify,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={[styles.ybox, className].filter(Boolean).join(' ')}
      style={vars}
      data-scroll={scroll ? 'true' : 'false'}
    >
      {Children.map(children, (child) => {
        if (child == null) return null;

        // 文本、数字等非 React 元素，自动包裹
        if (!isValidElement(child)) {
          return <Segment>{child}</Segment>;
        }

        // 已经是 Segment，直接使用
        if (child.type?.__YBOX_SEGMENT__) {
          return child;
        }

        // 普通子元素自动包一层 Segment
        return <Segment>{child}</Segment>;
      })}
    </div>
  );
});

YBox.Segment = Segment;

export default YBox;