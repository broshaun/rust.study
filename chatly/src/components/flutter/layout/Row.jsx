// src/components/flutter/Row/Row.jsx
import React from 'react';
import styles from './Row.module.css';
import { MainAxisAlignment, CrossAxisAlignment, MainAxisSize } from '../LayoutEnums';

const Row = ({
  // Flutter 核心属性
  children,
  child, // 兼容 Flutter 的 child 属性
  mainAxisAlignment = MainAxisAlignment.start,
  crossAxisAlignment = CrossAxisAlignment.center,
  mainAxisSize = MainAxisSize.max,
  spacing = 0, // Flutter 风格的子元素间距
  wrap = false, // 是否自动换行（对应 Flutter Wrap 组件的换行能力）
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
      // 水平间距（Row 是水平布局）
      return (
        <React.Fragment key={index}>
          <div className={styles.spacing} style={{ width: `${spacing}px` }} />
          {child}
        </React.Fragment>
      );
    });
  };

  // 核心样式
  const rowBaseStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: mainAxisAlignment,
    alignItems: crossAxisAlignment === CrossAxisAlignment.stretch ? 'stretch' : crossAxisAlignment,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    width: mainAxisSize === MainAxisSize.min ? 'min-content' : '100%',
    boxSizing: 'border-box',
    // 交叉轴拉伸时，子元素高度默认100%
    ...(crossAxisAlignment === CrossAxisAlignment.stretch && { height: '100%' }),
  };

  return (
    <div
      className={`${styles.row} ${className || ''}`}
      style={{ ...rowBaseStyle, ...style }}
    >
      {renderChildrenWithSpacing()}
    </div>
  );
};

export default Row;