// src/components/flutter/Column/Column.jsx
import React from 'react';
import styles from './Column.module.css';
import { MainAxisAlignment, CrossAxisAlignment, MainAxisSize } from '../LayoutEnums';

const Column = ({
  // Flutter 核心属性
  children,
  child, // 兼容 Flutter 的 child 属性
  mainAxisAlignment = MainAxisAlignment.start,
  crossAxisAlignment = CrossAxisAlignment.center,
  mainAxisSize = MainAxisSize.max,
  spacing = 0, // Flutter 风格的子元素间距
  wrap = false, // 是否自动换列
  // 扩展属性
  style, // 自定义样式覆盖
  className,
}) => {
  const content = child || children;

  // 处理子元素间距
  const renderChildrenWithSpacing = () => {
    if (spacing <= 0 || !content) return content;

    return React.Children.map(content, (child, index) => {
      if (!child || index === 0) return child;
      // 垂直间距（Column 是垂直布局）
      return (
        <React.Fragment key={index}>
          <div className={styles.spacing} style={{ height: `${spacing}px` }} />
          {child}
        </React.Fragment>
      );
    });
  };

  // 核心样式
  const columnBaseStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: mainAxisAlignment,
    alignItems: crossAxisAlignment === CrossAxisAlignment.stretch ? 'stretch' : crossAxisAlignment,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    height: mainAxisSize === MainAxisSize.min ? 'min-content' : '100%',
    boxSizing: 'border-box',
    // 交叉轴拉伸时，子元素宽度默认100%
    ...(crossAxisAlignment === CrossAxisAlignment.stretch && { width: '100%' }),
  };

  return (
    <div
      className={`${styles.column} ${className || ''}`}
      style={{ ...columnBaseStyle, ...style }}
    >
      {renderChildrenWithSpacing()}
    </div>
  );
};

export default Column;