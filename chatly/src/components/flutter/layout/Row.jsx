import React from 'react';
import styles from './Row.module.css';

/**
 * Row - 纯净布局版
 * 职责：仅作为水平轨道，负责子元素的横向排列。
 */
const Row = ({ children, width, style }) => {
  return (
    <div 
      className={styles.row} 
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        width: typeof width === 'number' ? `${width}px` : width || '100%',
        // 移除风格相关属性：不再干涉文字颜色和过渡动画
        ...style
      }}
    >
      {children}
    </div>
  );
};

/**
 * Col - 纯净栅格版
 * 职责：仅负责宽度比例锁定与对齐。
 */
const Col = ({ children, span = 'auto', style }) => {
  const flexWidth = typeof span === 'number' && span <= 1 
    ? `${span * 100}%` 
    : span;

  return (
    <div style={{
      width: flexWidth === 'auto' ? 'auto' : flexWidth,
      flexBasis: flexWidth === 'auto' ? 'auto' : flexWidth,
      flexShrink: 0,
      flexGrow: flexWidth === 'auto' ? 1 : 0,
      boxSizing: 'border-box',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      // 移除风格相关属性：不再干涉 WebkitFontSmoothing
      ...style
    }}>
      {children}
    </div>
  );
};

Row.Col = Col;

export { Row };