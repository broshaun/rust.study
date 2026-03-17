import React, { forwardRef } from "react";
import styles from './Container.module.css';

/**
 * Container - 主题感知容器
 *
 * 职责：
 * 1. 锁定空间
 * 2. 处理滚动
 * 3. 处理对齐
 * 4. 按需显示主题边框/背景/阴影
 *
 * 说明：
 * 当前 Container 默认是纵向布局（flex-direction: column）
 *
 * 所以：
 * - align   控制横向对齐（left / center / right / stretch）
 * - justify 控制纵向对齐（top / middle / bottom / between）
 *
 * Props
 * @param {React.ReactNode} children
 * @param {boolean} [verticalScroll=false] 是否开启纵向滚动
 * @param {boolean} [horizontalScroll=false] 是否开启横向滚动
 * @param {number|string} [width='100%'] 宽度
 * @param {number|string} [height='100%'] 高度
 * @param {number|string} [padding=0] 内边距
 * @param {number|string} [margin=0] 外边距
 * @param {'left'|'center'|'right'|'stretch'} [align='stretch']
 *        横向对齐（交叉轴）
 * @param {'top'|'middle'|'bottom'|'between'} [justify='top']
 *        纵向对齐（主轴）
 * @param {boolean} [bordered=true] 是否显示边框
 * @param {boolean} [surface=true] 是否启用主题面板背景/阴影/模糊
 * @param {string} [className='']
 * @param {React.CSSProperties} [style]
 */
export const Container = forwardRef(({
  children,
  verticalScroll = false,
  horizontalScroll = false,
  width = '100%',
  height = '100%',
  padding = 0,
  margin = 0,
  align = 'stretch',
  justify = 'top',
  bordered = true,
  surface = true,
  className = '',
  style
}, ref) => {
  const f = (v) => typeof v === 'number' ? `${v}px` : v;

  // Container 默认是 column：
  // align-items 负责横向，justify-content 负责纵向
  const alignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    stretch: 'stretch'
  };

  const justifyMap = {
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end',
    between: 'space-between'
  };

  const vars = {
    '--cont-w': f(width),
    '--cont-h': f(height),
    '--cont-pad': f(padding),
    '--cont-mar': f(margin),
    '--cont-align': alignMap[align] || align,
    '--cont-justify': justifyMap[justify] || justify,
    ...style
  };

  return (
    <div
      ref={ref}
      className={[styles.container, className].filter(Boolean).join(' ')}
      style={vars}
      data-v={verticalScroll ? 'true' : 'false'}
      data-h={horizontalScroll ? 'true' : 'false'}
      data-border={bordered ? 'true' : 'false'}
      data-surface={surface ? 'true' : 'false'}
    >
      {children}
    </div>
  );
});

export default Container;