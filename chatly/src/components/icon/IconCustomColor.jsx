import React from '.store/react@18.3.1/node_modules/react'
import { IconSvg } from './IconSvg'
import './IconCustomColor.css'

const COLORS = new Set(['orange', 'red', 'green', 'gray'])

/**
 * 用法：
 * 1. 仅图标
 * <IconCustomColor name="times-circle" color="red" />
 * 
 * 2. 图标 + 下方标签
 * <IconCustomColor name="check-circle" color="green" size={20} bottomLabel="成功" />
 * 
 * 3. 图标 + 右侧标签
 * <IconCustomColor name="times-circle" color="red" size={24} rightLabel="关闭" onClick={() => console.log('点击了关闭')} />
 * 
 * 4. 图标 + 下方标签 + 右侧标签
 * <IconCustomColor name="home" color="orange" size={28} bottomLabel="首页" rightLabel="进入" />
 */
export const IconCustomColor = ({ 
  name, 
  color = 'gray', 
  size = 24, 
  onClick, // 原有点击事件
  bottomLabel, // 新增：图标下方标签
  rightLabel, // 新增：图标右侧标签
  labelStyle = {} // 新增：标签自定义样式（可选，提升灵活性）
}) => {
  const finalColor = COLORS.has(color) ? color : 'orange'

  // 定义默认标签样式（可通过 labelStyle 覆盖）
  const defaultLabelStyle = {
    fontSize: '14px',
    color: '#333',
    margin: '0 4px',
    userSelect: 'none' // 禁止标签文字选中，提升交互体验
  }

  return (
    // 外层容器：根据是否有右侧标签，切换布局（纵向/横向）
    <div
      style={{
        display: 'flex',
        alignItems: rightLabel ? 'center' : 'center', // 有右侧标签则横向居中，无则纵向居中
        flexDirection: rightLabel ? 'row' : 'column', // 有右侧标签横向排列，无则纵向排列
        cursor: onClick ? 'pointer' : 'default',
        ...(rightLabel ? { gap: '8px' } : { gap: '4px' }) // 间距优化
      }}
      onClick={onClick} // 点击事件绑定到外层容器，确保点击标签也能触发
    >
      {/* 图标容器（原有功能保留） */}
      <span
        className={`svg-icon-custom-color icon-${finalColor}`}
        style={{ width: size, height: size, display: 'inline-block' }}
      >
        <IconSvg name={name} size={size} />
      </span>

      {/* 右侧标签：有 rightLabel 才渲染（横向排列在图标右侧） */}
      {rightLabel && (
        <span style={{ ...defaultLabelStyle, ...labelStyle }}>
          {rightLabel}
        </span>
      )}

      {/* 下方标签：有 bottomLabel 才渲染（纵向排列在图标下方，无论是否有右侧标签） */}
      {bottomLabel && (
        <span 
          style={{ 
            ...defaultLabelStyle, 
            ...labelStyle,
            marginTop: rightLabel ? '4px' : '0', // 有右侧标签时，下方标签整体下移，布局更美观
            whiteSpace: 'nowrap' // 禁止换行
          }}
        >
          {bottomLabel}
        </span>
      )}
    </div>
  )
}