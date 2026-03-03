import React, { memo, useMemo } from 'react'
import styles from './Col.module.css'

/**
 * Col 组件：负责列的等分/宽度控制/对齐/边框等视觉样式
 * 配合 Row 组件使用，替代原 Row.Item 的功能
 * 核心：控制自身在父容器（Row）中的占比、对齐方式、边框样式
 * 移除对外的 flex/style 属性，仅通过 span/width 控制占比
 */
const Col = memo(({
  // 核心：列占比（等分），默认1份
  span = 1,
  // 固定宽度（优先级高于 span）
  width,
  // 内容垂直对齐
  align = 'center',
  // 内容水平对齐
  justify = 'center',
  // 边框相关
  border = 0,
  borderColor = '#e0e0e0',
  borderRadius = 0,
  borderStyle = 'solid',
  // 子元素
  children
}) => {
  // 处理边框样式：number转px，空值则无边框
  const bw = border ? (typeof border === 'number' ? `${border}px` : border) : ''

  // 计算flex样式（仅保留 span/width 逻辑）
  const flexStyle = useMemo(() => {
    const style = {
      minWidth: 0, // 关键：防止内容撑爆flex容器
      boxSizing: 'border-box'
    }

    // 1. 优先级：固定宽度
    if (width != null) {
      style.width = typeof width === 'number' ? `${width}px` : width
      style.flex = '0 0 auto' // 固定宽度不伸缩
    }
    // 2. 默认：span等分（按比例占位）
    else {
      style.flex = `${span} ${span} 0`
    }

    return style
  }, [width, span])

  // 组件内部样式（不再合并外部style）
  const colStyle = {
    // flex占比样式
    ...flexStyle,
    // 边框样式
    border: bw ? `${bw} ${borderStyle} ${borderColor}` : 'none',
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    // 内容对齐样式
    display: 'flex',
    alignItems: align,
    justifyContent: justify,
    // 基础盒模型
    boxSizing: 'border-box',
    // 透明背景（和Row保持一致）
    background: 'transparent'
  }

  return (
    <div className={styles.col} style={colStyle}>
      {children}
    </div>
  )
})

export default Col