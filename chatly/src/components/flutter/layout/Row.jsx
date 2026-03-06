import React from 'react';
import styles from './Row.module.css';

/**
 * Row - 万能风格适配版
 * 职责：作为水平轨道，通过变量系统同步整行色调
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
        color: 'var(--text-primary)', // 确保整行文字颜色跟随皮肤
        transition: 'color 0.4s ease',
        ...style
      }}
    >
      {children}
    </div>
  );
};

/**
 * Col - 强约束栅格
 * 职责：锁定宽度比例，确保在液态或金属背景下对齐不偏移
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
      /* 核心：在复杂背景下提升文字渲染质量 */
      WebkitFontSmoothing: 'antialiased',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      ...style
    }}>
      {children}
    </div>
  );
};

Row.Col = Col;

export { Row };