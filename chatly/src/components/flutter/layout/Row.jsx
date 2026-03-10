import React from 'react';
import styles from './Row.module.css';

/**
 * Col - 比例分割单元
 */
const Col = ({ children, span = 1 }) => {
  return (
    <div className={styles.col} style={{ '--col-span': span }}>
      {children}
    </div>
  );
};

/**
 * Row - 横向轨道
 * 仅增加 height 属性控制高度
 */
export const Row = ({ children, height }) => {
  // 如果传了 height，就转成带有 px 的变量，没传就是空对象
  const vars = height ? { '--row-h': typeof height === 'number' ? `${height}px` : height } : {};

  return (
    <div className={styles.row} style={vars}>
      {children}
    </div>
  );
};

Row.Col = Col;