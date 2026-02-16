import React from 'react';
import styles from './Container.module.css';

/**
 * 通用容器组件：默认从上往下垂直排列 + 统一间距 + 滚动条配置
 * @param {object} props - 组件属性
 * @param {React.ReactNode} props.children - 容器子元素
 * @param {boolean} [props.verticalScroll=false] - 是否开启垂直（上下）滚动条
 * @param {boolean} [props.horizontalScroll=false] - 是否开启水平（左右）滚动条
 * @param {number} [props.gap=16] - 子元素之间的统一间距（px），默认16px（美观且常用）
 * @param {string} [props.alignItems='flex-start'] - 水平对齐方式（垂直排列时）：flex-start（左对齐）、center（居中）、flex-end（右对齐）
 * @param {boolean} [props.fullWidth=false] - 子元素是否占满容器宽度，默认false
 * @returns {React.ReactElement} 通用容器组件
 */
const Container = ({
  children,
  verticalScroll = false,
  horizontalScroll = false,
  gap = 16, // 恢复注释中默认的16px，原代码写的1px不符合注释说明
  alignItems = 'flex-start',
  fullWidth = false
}) => {
  // 纵向排列核心布局样式（默认从上往下，间距统一）
  const layoutStyles = {
    display: 'flex',
    flexDirection: 'column', // 固定默认垂直排列（从上往下）
    alignItems, // 水平对齐方式（控制左右规整）
    gap: `${gap}px` // 统一子元素间距
  };

  return (
    <div
      className={`${styles.container} ${fullWidth ? styles.fullWidthChildren : ''}`}
      style={layoutStyles}
      data-vertical-scroll={verticalScroll}
      data-horizontal-scroll={horizontalScroll}
    >
      {children}
    </div>
  );
};

export default Container;