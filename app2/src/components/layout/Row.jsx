import React, { memo, useMemo, Children, isValidElement } from 'react'
import styles from './Row.module.css'

/**
 * Row.Item：负责自身内容对齐 + 边框等视觉样式
 * Row：只负责布局（span 等分 / gap / wrap / align）
 */

const Item = memo(({
  span = 1,
  width,
  flex,
  align = 'center',
  justify = 'center',
  border = 0,
  borderColor = '#e0e0e0',
  borderRadius = 0,
  borderStyle = 'solid',
  style,
  children
}) => {
  const bw = border ? (typeof border === 'number' ? `${border}px` : border) : ''

  const itemStyle = {
    border: bw ? `${bw} ${borderStyle} ${borderColor}` : 'none',
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    display: 'flex',
    alignItems: align,
    justifyContent: justify,
    boxSizing: 'border-box',
    ...style, // ✅ 关键：让 Row 注入的 flex/width 生效
  }

  return (
    <div className={styles.rowItem} data-span={span} style={itemStyle}>
      {children}
    </div>
  )
})

const Row = memo(({
  children,
  gap = 0,
  align = 'center',
  wrap = false,
  fullWidth = true,
  width = 'auto',
  height = 'auto',
}) => {
  const { itemList } = useMemo(() => {
    const list = []
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === Item) {
        list.push(child)
      }
    })
    return { itemList: list }
  }, [children])

  const dim = (v, k) => (v === 'auto' ? {} : { [k]: typeof v === 'number' ? `${v}px` : v })

  const rowStyle = {
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    ...dim(width, 'width'),
    ...dim(height, 'height'),
    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
  }

  const rowClasses = [
    styles.row,
    fullWidth && styles.fullWidth,
    styles[`align-${align}`],
    wrap ? styles.wrap : styles.nowrap,
  ].filter(Boolean).join(' ')

  // ✅ 核心：用 flex 直接按 span 分配（无需计算宽度）
  const renderItems = () => itemList.map((el, idx) => {
    const p = el.props
    const span = Number(p.span) || 1

    const injectedStyle = {}

    // 1) 最高优先级：用户显式 flex
    if (p.flex) {
      injectedStyle.flex = p.flex
    }
    // 2) 次优先级：用户显式 width（固定宽）
    else if (p.width != null) {
      injectedStyle.width = typeof p.width === 'number' ? `${p.width}px` : p.width
      injectedStyle.flex = '0 0 auto'
    }
    // 3) 默认：span 等分（按比例占位）
    else {
      injectedStyle.flex = `${span} ${span} 0`
      injectedStyle.minWidth = 0
    }

    return React.cloneElement(el, {
      key: el.key ?? idx,
      style: { ...injectedStyle, ...p.style },
    })
  })

  return (
    <div className={rowClasses} style={rowStyle}>
      {renderItems()}
    </div>
  )
})

Row.Item = Item
export default Row
