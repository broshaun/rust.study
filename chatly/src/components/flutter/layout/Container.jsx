import React from 'react';
import styles from './Container.module.css';

// Flutter 对齐方式枚举
export const Alignment = {
  topLeft: 'top-left',
  topCenter: 'top-center',
  topRight: 'top-right',
  centerLeft: 'center-left',
  center: 'center',
  centerRight: 'center-right',
  bottomLeft: 'bottom-left',
  bottomCenter: 'bottom-center',
  bottomRight: 'bottom-right',
};

// Flutter BoxFit 枚举
export const BoxFit = {
  contain: 'contain',
  cover: 'cover',
  fill: 'fill',
  fitWidth: 'fit-width',
  fitHeight: 'fit-height',
  none: 'none',
  scaleDown: 'scale-down',
};

// Flutter 边框样式枚举
export const BorderStyle = {
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted',
  none: 'none',
};

const Container = ({
  // Flutter 核心属性
  child,
  children,
  width,
  height,
  padding,
  margin,
  color,
  alignment = Alignment.center,
  decoration,
  constraints,
  transform,
  clipBehavior = 'auto',
  boxFit,
  // 安全区适配扩展属性
  safeArea = { top: false, bottom: false, left: false, right: false },
}) => {
  const content = child || children;

  // 解析间距（padding/margin）：数字/对象/数组转标准 CSS 值
  const parseSpacing = (value) => {
    if (value === null || value === undefined) return '0px';
    if (typeof value === 'number') return `${value}px`;
    if (typeof value === 'object' && !Array.isArray(value)) {
      return `${value.top || 0}px ${value.right || 0}px ${value.bottom || 0}px ${value.left || 0}px`;
    }
    if (Array.isArray(value)) {
      switch (value.length) {
        case 1: return `${value[0]}px`;
        case 2: return `${value[0]}px ${value[1]}px`;
        case 3: return `${value[0]}px ${value[1]}px ${value[2]}px`;
        case 4: return `${value[0]}px ${value[1]}px ${value[2]}px ${value[3]}px`;
        default: return '0px';
      }
    }
    return value;
  };

  // 解析对齐方式到 CSS flex 属性
  const getAlignStyle = () => {
    const alignMap = {
      [Alignment.topLeft]: { justifyContent: 'flex-start', alignItems: 'flex-start' },
      [Alignment.topCenter]: { justifyContent: 'center', alignItems: 'flex-start' },
      [Alignment.topRight]: { justifyContent: 'flex-end', alignItems: 'flex-start' },
      [Alignment.centerLeft]: { justifyContent: 'flex-start', alignItems: 'center' },
      [Alignment.center]: { justifyContent: 'center', alignItems: 'center' },
      [Alignment.centerRight]: { justifyContent: 'flex-end', alignItems: 'center' },
      [Alignment.bottomLeft]: { justifyContent: 'flex-start', alignItems: 'flex-end' },
      [Alignment.bottomCenter]: { justifyContent: 'center', alignItems: 'flex-end' },
      [Alignment.bottomRight]: { justifyContent: 'flex-end', alignItems: 'flex-end' },
    };
    return alignMap[alignment];
  };

  const alignStyle = getAlignStyle();

  // 解析尺寸约束
  const constraintStyle = {
    minWidth: constraints?.minWidth ? `${constraints.minWidth}px` : 'auto',
    maxWidth: constraints?.maxWidth ? `${constraints.maxWidth}px` : 'none',
    minHeight: constraints?.minHeight ? `${constraints.minHeight}px` : 'auto',
    maxHeight: constraints?.maxHeight ? `${constraints.maxHeight}px` : 'none',
  };

  // 解析变换
  const parseTransform = () => {
    if (!transform) return 'none';
    const transforms = [];
    if (transform.rotate) transforms.push(`rotate(${transform.rotate}deg)`);
    if (transform.scale) transforms.push(`scale(${transform.scale})`);
    if (transform.translate) {
      const { x = 0, y = 0 } = transform.translate;
      transforms.push(`translate(${x}px, ${y}px)`);
    }
    return transforms.join(' ');
  };

  // 解析 BoxFit 到 CSS background-size
  const parseBoxFit = () => {
    const fitMap = {
      [BoxFit.contain]: 'contain',
      [BoxFit.cover]: 'cover',
      [BoxFit.fill]: '100% 100%',
      [BoxFit.fitWidth]: '100% auto',
      [BoxFit.fitHeight]: 'auto 100%',
      [BoxFit.none]: 'auto',
      [BoxFit.scaleDown]: 'contain',
    };
    return fitMap[boxFit] || 'auto';
  };

  // 合并最终样式
  const containerStyle = {
    // 基础尺寸
    width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
    // 间距
    padding: parseSpacing(padding),
    margin: parseSpacing(margin),
    // 背景与装饰
    backgroundColor: decoration?.color || color || 'transparent',
    borderRadius: decoration?.borderRadius ? `${decoration.borderRadius}px` : '0px',
    border: decoration?.border
      ? `${decoration.border.width || 1}px ${decoration.border.style || BorderStyle.solid} ${decoration.border.color || '#000'}`
      : 'none',
    boxShadow: decoration?.boxShadow || 'none',
    backgroundImage: decoration?.image ? `url(${decoration.image})` : 'none',
    backgroundSize: decoration?.image ? parseBoxFit() : 'auto',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    // 对齐
    ...alignStyle,
    // 尺寸约束
    ...constraintStyle,
    // 变换
    transform: parseTransform(),
    // 裁剪
    overflow: clipBehavior === 'clip' ? 'hidden' : clipBehavior === 'noClip' ? 'visible' : 'auto',
    // 安全区适配
    paddingTop: safeArea.top ? 'var(--safe-area-top, 0px)' : '0px',
    paddingBottom: safeArea.bottom ? 'var(--safe-area-bottom, 0px)' : '0px',
    paddingLeft: safeArea.left ? 'var(--safe-area-left, 0px)' : '0px',
    paddingRight: safeArea.right ? 'var(--safe-area-right, 0px)' : '0px',
  };

  // 子元素样式（适配 BoxFit）
  const childStyle = {};
  if (boxFit && React.Children.count(content) === 1) {
    childStyle.objectFit = boxFit;
    childStyle.width = '100%';
    childStyle.height = '100%';
  }

  return (
    <div className={styles.container} style={containerStyle}>
      {React.Children.map(content, (child) =>
        React.isValidElement(child) ? React.cloneElement(child, { style: { ...child.props.style, ...childStyle } }) : child
      )}
    </div>
  );
};

export default Container;