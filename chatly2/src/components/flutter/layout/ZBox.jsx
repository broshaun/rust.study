import React from "react"
import styles from './ZBox.module.css'

const toUnit = (v) => {
  if (v == null || v === '') return undefined
  return typeof v === 'number' ? `${v}px` : v
}

const posMap = {
  center: 'center',

  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',

  'top-left': 'top-left',
  'top-right': 'top-right',

  'bottom-left': 'bottom-left',
  'bottom-right': 'bottom-right',

  fill: 'fill'
}

const Layer = ({
  children,
  position = 'center',
  z = 0,
  style
}) => {

  const vars = {
    '--zb-pos': posMap[position] || 'center',
    '--zb-z': z,
    ...style
  }

  return (
    <div
      className={styles.layer}
      data-pos={position}
      style={vars}
    >
      {children}
    </div>
  )
}

Layer.__ZBOX_LAYER__ = true

export const ZBox = ({
  children,
  width = '100%',
  height = '100%',
  clip = false,
  style
}) => {

  const vars = {
    '--zb-w': toUnit(width) || '100%',
    '--zb-h': toUnit(height) || '100%',
    '--zb-overflow': clip ? 'hidden' : 'visible',
    ...style
  }

  return (
    <div className={styles.zbox} style={vars}>
      {children}
    </div>
  )
}

ZBox.Layer = Layer

export default ZBox