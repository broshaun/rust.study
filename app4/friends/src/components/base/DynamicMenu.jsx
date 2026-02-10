import React from 'react'
import styles from './DynamicMenu.module.css'
import { IconCustomColor } from 'components/icon'

// 判断 children 是否是 items 数组
const isItemsArray = (v) =>
  Array.isArray(v) &&
  v.length > 0 &&
  v.every(
    (it) =>
      it &&
      typeof it === 'object' &&
      !React.isValidElement(it) &&
      'key' in it
  )

export const DynamicMenu = ({ children }) => {
  const items = isItemsArray(children) ? children : null
  const nodes = items ? [] : React.Children.toArray(children).filter(Boolean)

  const left = []
  const right = []

  if (items) {
    items
      .filter((it) => it && it.show !== false)
      .forEach((it) => {
        ;(it.position === 'right' ? right : left).push(it)
      })
  } else {
    nodes.forEach((node) => {
      ;(node?.props?.position === 'right' ? right : left).push(node)
    })
  }

  const renderItem = (it, idx, position) => (
    <DynamicMenu.Item
      key={`${it.key}-${idx}`}
      position={position}
      onClick={() => it.onClick?.(it.key, it)}
    >
      {it.icon?.name && (
        <IconCustomColor
          name={it.icon.name}
          color={it.icon.color}
          size={it.icon.size || 16}
        />
      )}
      <span>{it.lable ?? it.label ?? ''}</span>
    </DynamicMenu.Item>
  )

  return (
    <nav className={styles.menu}>
      {/* 左侧 */}
      {items ? left.map((it, i) => renderItem(it, i)) : left}

      {/* 右侧 */}
      {right.length > 0 && (
        <div className={styles.right}>
          {items ? right.map((it, i) => renderItem(it, i, 'right')) : right}
        </div>
      )}
    </nav>
  )
}

DynamicMenu.Item = ({ onClick, children, className = '', position }) => {
  const cls = [
    styles.item,
    position === 'right' ? styles.itemRight : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  )
}
