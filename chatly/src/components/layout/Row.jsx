import React, { memo } from '.store/react@18.3.1/node_modules/react'
import styles from './Row.module.css'

/**
 * Row 组件（最终版）
 * ---------------------------------------
 * 一个纯粹的 Flex 横向布局容器。
 *
 * 设计原则：
 * 1️⃣ 只负责布局（flex 排列、对齐、间距、边框）
 * 2️⃣ 不负责子元素宽度控制（无 span 占比逻辑）
 * 3️⃣ 不干预子元素样式
 * 4️⃣ 支持灵活自定义 flex
 *
 * 适用场景：
 * - 按钮横向排列
 * - 表单输入项组合
 * - 卡片内横向排版
 * - 居中布局容器
 *
 * --------------------------------------------------
 * Props 说明
 * --------------------------------------------------
 *
 * @param {string} justify
 *   主轴对齐方式（默认 center）
 *   可选：flex-start | center | flex-end | space-between | space-around | space-evenly
 *
 * @param {string} align
 *   交叉轴对齐方式（默认 center）
 *   可选：flex-start | center | flex-end | stretch
 *
 * @param {number|string} border
 *   边框宽度（0 表示无边框）
 *   可传 number（自动 px）或 string（如 '1px'）
 *
 * @param {string} borderColor
 *   边框颜色
 *
 * @param {string} borderStyle
 *   边框样式（solid | dashed | dotted 等）
 *
 * @param {number|string} borderRadius
 *   圆角大小
 *
 * @param {number|string} gap
 *   子元素间距（支持 number 自动 px 或 string）
 *
 * @param {boolean} wrap
 *   是否换行（默认 false）
 *
 * @param {boolean} fullWidth
 *   是否占满父容器宽度（默认 true）
 *
 * @param {number|string} width
 *   自定义宽度（默认 auto）
 *
 * @param {number|string} height
 *   自定义高度（默认 auto）
 *
 * @param {string} flex
 *   自定义 flex 值（如 '1', '0 0 200px'）
 *   用于在父级为 flex 布局时控制自身伸缩
 *
 * @param {object} style
 *   额外内联样式（最高优先级）
 *
 * @param {ReactNode} children
 *   子元素
 *
 * --------------------------------------------------
 * 使用示例
 * --------------------------------------------------
 *
 * <Row gap={16} justify="space-between">
 *   <Button>取消</Button>
 *   <Button>确定</Button>
 * </Row>
 *
 * <Row align="flex-start" wrap gap={8}>
 *   <Tag />
 *   <Tag />
 *   <Tag />
 * </Row>
 *
 * --------------------------------------------------
 * 注意事项
 * --------------------------------------------------
 * - Row 只做布局，不控制子元素宽度
 * - 若需要等分布局，请自行给子元素设置 flex
 * - 若父级为 flex 布局，可通过 flex 属性控制 Row 自身
 *
 */
const Row = memo(({
  justify = 'center',
  align = 'center',
  border = 0,
  borderColor = '#e0e0e0',
  borderRadius = 0,
  borderStyle = 'solid',

  gap = 0,
  wrap = false,
  fullWidth = true,
  width = 'auto',
  height = 'auto',
  flex,
  style,
  children
}) => {

  // 处理边框宽度
  // 支持 number 自动转 px，或直接传入 string
  const bw = border
    ? (typeof border === 'number' ? `${border}px` : border)
    : ''

  // 处理自定义 flex（仅当传入时生效）
  const flexStyle = {}
  if (flex) {
    flexStyle.flex = flex
    // 防止内容撑爆布局（尤其在 flex:1 时）
    flexStyle.minWidth = 0
  }

  // 尺寸处理函数：number 自动转 px
  const dim = (v, k) =>
    v === 'auto'
      ? {}
      : { [k]: typeof v === 'number' ? `${v}px` : v }

  // 合并最终样式
  const rowStyle = {
    gap: typeof gap === 'number' ? `${gap}px` : gap,

    ...dim(width, 'width'),
    ...dim(height, 'height'),

    border: bw ? `${bw} ${borderStyle} ${borderColor}` : 'none',
    borderRadius: typeof borderRadius === 'number'
      ? `${borderRadius}px`
      : borderRadius,

    display: 'flex',
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : 'nowrap',

    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
    background: 'transparent',

    ...flexStyle,
    ...style
  }

  const rowClasses = [
    styles.row,
    fullWidth && styles.fullWidth
  ].filter(Boolean).join(' ')

  return (
    <div className={rowClasses} style={rowStyle}>
      {children}
    </div>
  )
})

export default Row