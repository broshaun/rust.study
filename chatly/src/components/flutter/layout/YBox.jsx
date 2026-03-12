import React, { forwardRef } from 'react';
import styles from './YBox.module.css';

const toUnit = (v) => {
  if (v == null || v === '') return undefined;
  return typeof v === 'number' ? `${v}px` : v;
};

/**
 * YBox - 纵向布局容器 (Vertical Layout)
 *
 * 用途：
 * 用于将子元素按 **从上到下** 的顺序排列，
 * 类似 Flutter 的 Column / CSS 的 flex-direction: column。
 *
 * 设计原则：
 * - 只负责布局，不负责背景或皮肤
 * - 默认不改变子元素宽度
 * - 子元素默认占满容器宽度
 * - 支持滚动容器
 *
 * --------------------------------------------------
 * Props
 * --------------------------------------------------
 *
 * @param {React.ReactNode} children
 * 子元素列表，会按从上到下顺序排列
 *
 * @param {number|string} [height]
 * 容器高度
 *
 * 示例：
 * height={400}
 * height="100vh"
 * height="100%"
 *
 * 默认：auto
 *
 * @param {number|string} [width="100%"]
 * 容器宽度
 *
 * 示例：
 * width={300}
 * width="80%"
 * width="100%"
 *
 * @param {number|string} [gap=0]
 * 子元素之间的间距
 *
 * 示例：
 * gap={8}
 * gap="12px"
 *
 * @param {number|string} [padding=0]
 * 容器内边距
 *
 * 示例：
 * padding={10}
 * padding="16px"
 *
 * @param {'top'|'middle'|'bottom'|'between'} [justify='top']
 * 控制子元素 **垂直分布方式**
 *
 * top      → 从顶部开始排列
 * middle   → 垂直居中
 * bottom   → 从底部开始排列
 * between  → 两端分布
 *
 * @param {boolean} [verticalScroll=false]
 * 是否开启纵向滚动
 *
 * true  → overflow-y: auto
 * false → 不滚动
 *
 * @param {React.CSSProperties} [style]
 * 额外样式
 *
 * @param {string} [className]
 * 自定义 className
 *
 * --------------------------------------------------
 * 特性
 * --------------------------------------------------
 *
 * 1. 默认不会限制子元素宽度
 *
 * 子元素默认：
 *
 * width: 100%
 * min-width: 0
 *
 * 可以避免 flex 布局中常见的溢出问题。
 *
 * --------------------------------------------------
 *
 * 2. 支持滚动容器
 *
 * 示例：
 *
 * <YBox verticalScroll height="100%">
 *   {...content}
 * </YBox>
 *
 * --------------------------------------------------
 *
 * 3. 支持 ref
 *
 * 示例：
 *
 * const ref = useRef(null)
 *
 * <YBox ref={ref} verticalScroll height={400}/>
 *
 * --------------------------------------------------
 *
 * 4. 推荐使用场景
 *
 * 页面纵向结构：
 *
 * <YBox gap={12}>
 *   <Header/>
 *   <Content/>
 *   <Footer/>
 * </YBox>
 *
 * 列表容器：
 *
 * <YBox verticalScroll height="100%">
 *   {items.map(...)}
 * </YBox>
 *
 */

export const YBox = forwardRef(({
  children,
  height,
  width = '100%',
  gap = 0,
  padding = 0,
  justify = 'top',
  verticalScroll = false,
  style,
  className = ''
}, ref) => {

  const justifyMap = {
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end',
    between: 'space-between'
  };

  const vars = {
    '--yb-h': height == null ? 'auto' : toUnit(height),
    '--yb-w': width == null ? '100%' : toUnit(width),
    '--yb-gap': toUnit(gap) || '0px',
    '--yb-pad': toUnit(padding) || '0px',
    '--yb-justify': justifyMap[justify] || justify,
    ...style
  };

  return (
    <div
      ref={ref}
      className={[styles.ybox, className].filter(Boolean).join(' ')}
      style={vars}
      data-scroll={verticalScroll ? 'true' : 'false'}
    >
      {children}
    </div>
  );
});

export default YBox;