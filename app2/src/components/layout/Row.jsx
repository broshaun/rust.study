import React, { memo } from 'react'
import styles from './Row.module.css'

/**
 * 最终版 Row 组件：纯布局容器，移除 span 属性
 * 核心：仅负责 flex 布局、对齐、间距、边框等基础样式，无占比控制
 */
const Row = memo(({
  // 移除 span 属性，保留其他布局对齐属性
  justify = 'center',
  align = 'center',
  border = 0,
  borderColor = '#e0e0e0',
  borderRadius = 0,
  borderStyle = 'solid',

  // Row 核心布局属性
  gap = 0,
  wrap = false,
  fullWidth = true,
  width = 'auto',
  height = 'auto',
  flex, // 自定义 flex 属性（用户按需传入）
  style,
  children
}) => {
  // 处理边框样式
  const bw = border ? (typeof border === 'number' ? `${border}px` : border) : ''

  // 计算 flex 样式（仅保留自定义 flex，移除 span 相关逻辑）
  const flexStyle = {}
  if (flex) {
    flexStyle.flex = flex
    flexStyle.minWidth = 0 // 防止内容撑爆（仅自定义 flex 时生效）
  }

  // 处理尺寸（number 转 px）
  const dim = (v, k) => (v === 'auto' ? {} : { [k]: typeof v === 'number' ? `${v}px` : v })

  // 合并所有样式
  const rowStyle = {
    // 布局基础样式
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    ...dim(width, 'width'),
    ...dim(height, 'height'),
    // 边框样式
    border: bw ? `${bw} ${borderStyle} ${borderColor}` : 'none',
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    // flex 对齐样式
    display: 'flex',
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    // 基础盒模型
    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
    background: 'transparent',
    // 自定义 flex（用户按需传入）
    ...flexStyle,
    // 用户自定义样式（最高优先级）
    ...style
  }

  // 合并类名
  const rowClasses = [
    styles.row,
    fullWidth && styles.fullWidth
  ].filter(Boolean).join(' ')

  return (
    <div className={rowClasses} style={rowStyle}>
      {/* 直接渲染子元素 */}
      {children}
    </div>
  )
})

export default Row