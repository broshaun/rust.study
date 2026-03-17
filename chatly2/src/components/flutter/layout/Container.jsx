import React from "react";
import styles from './Container.module.css';

/**
 * Container - 主题感知容器 (React 19 适配版)
 * * 核心变化：
 * - 移除了 forwardRef，直接解构 ref。
 * - 保持了直角风格的逻辑。
 */
export const Container = ({
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
  style,
  ref, // ✅ React 19 直接从 props 中获取 ref
}) => {
  const f = (v) => typeof v === 'number' ? `${v}px` : v;

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
      ref={ref} // ✅ 直接绑定
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
};

export default Container;