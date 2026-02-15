import React from 'react';
import styles from './Container.module.css';

/**
 * 通用容器组件：默认从上往下垂直排列 + 统一间距 + 滚动条配置
 * @param {object} props - 组件属性
 * @param {React.ReactNode} props.children - 容器子元素
 * @param {boolean} [props.verticalScroll=false] - 是否开启垂直（上下）滚动条
 * @param {boolean} [props.horizontalScroll=false] - 是否开启水平（左右）滚动条
 * @param {string} [props.className] - 自定义类名，用于扩展样式
 * @param {object} [props.style] - 自定义内联样式
 * @param {number} [props.gap=16] - 子元素之间的统一间距（px），默认16px（美观且常用）
 * @param {string} [props.alignItems='flex-start'] - 水平对齐方式（垂直排列时）：flex-start（左对齐）、center（居中）、flex-end（右对齐）
 * @param {boolean} [props.fullWidth=false] - 子元素是否占满容器宽度，默认false
 * @returns {React.ReactElement} 通用容器组件
 */
const Container = ({
  children,
  verticalScroll = false,
  horizontalScroll = false,
  className = '',
  style = {},
  gap = 1,
  alignItems = 'flex-start',
  fullWidth = false
}) => {
  // 纵向排列核心布局样式（默认从上往下，间距统一）
  const layoutStyles = {
    display: 'flex',
    flexDirection: 'column', // 固定默认垂直排列（从上往下）
    alignItems, // 水平对齐方式（控制左右规整）
    gap: `${gap}px`, // 统一子元素间距
    ...style
  };

  return (
    <div
      className={`${styles.container} ${fullWidth ? styles.fullWidthChildren : ''} ${className}`}
      style={layoutStyles}
      data-vertical-scroll={verticalScroll}
      data-horizontal-scroll={horizontalScroll}
    >
      {children}
    </div>
  );
};

export default Container;