import React, { Children, isValidElement } from "react";
import styles from './YBox.module.css';

const toUnit = (v) => (typeof v === 'number' ? `${v}px` : v);

const Segment = ({ children, align, width, className = '', style }) => {
  const segmentStyle = {
    width: width != null ? toUnit(width) : '100%',
    ...style,
  };
  return <div className={`${styles.segment} ${className}`} style={segmentStyle}>{children}</div>;
};
Segment.__YBOX_SEGMENT__ = true;

export const YBox = ({
  children, width = '100%', height, gap = 0, padding = 0, align = 'stretch', justify = 'top',
  scroll = false, className = '', style, ref,
}) => {
  const vars = {
    '--yb-w': toUnit(width),
    '--yb-h': toUnit(height) || 'auto',
    '--yb-gap': toUnit(gap),
    '--yb-pad': toUnit(padding),
    ...style,
  };

  return (
    <div ref={ref} className={`${styles.ybox} ${className}`} style={vars} data-scroll={scroll}>
      {Children.map(children, child => {
        if (child == null) return null;
        if (isValidElement(child) && child.type?.__YBOX_SEGMENT__) return child;
        return <Segment>{child}</Segment>;
      })}
    </div>
  );
};
YBox.Segment = Segment;