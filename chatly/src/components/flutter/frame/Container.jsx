import React, { forwardRef, useMemo } from 'react';
import styles from './Container.module.css';

/**
 * Container - 骨架支撑容器
 * 职责：
 * 1. 物理空间锁定：为内部组件提供稳定的视口，防止被内容撑开。
 * 2. 引用透传：支持 forwardRef，供外部钩子（如 useVirtualList）绑定 DOM 节点。
 */
export const Container = forwardRef((
  {
    children,          // 容器内部子元素
    verticalScroll = false,  // 是否开启纵向滚动
    horizontalScroll = false, // 是否开启横向滚动
    width,             // 容器宽度 (number | string)
    height,            // 容器高度 (number | string)
    padding,           // 容器内边距 (number | string)
    margin             // 容器外边距 (number | string)
  },
  ref
) => {
  // 尺寸格式化：将数字转换为 px，保留字符串原样，处理 undefined
  const formatSize = (v) => {
    if (v === undefined || v === null) return undefined;
    return typeof v === 'number' ? `${v}px` : v;
  };

  // 使用 useMemo 缓存 CSS 变量对象
  // 优化点：避免每次父组件重新渲染时都生成新的对象引用，减少子组件无效更新
  const cssVars = useMemo(() => ({
    '--c-w': formatSize(width),
    '--c-h': formatSize(height),
    '--c-p': formatSize(padding),
    '--c-m': formatSize(margin)
  }), [width, height, padding, margin]);

  return (
    <div
      ref={ref}
      className={styles.container}
      style={cssVars}
      // 使用 data- 属性映射布尔值，方便 CSS 状态切换
      data-v={String(verticalScroll)}
      data-h={String(horizontalScroll)}
    >
      {children}
    </div>
  );
});

