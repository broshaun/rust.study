import React from 'react';
import styles from './Button.module.css';

// Flutter 按钮类型枚举
export const ButtonType = {
  elevated: 'elevated', // 带阴影的凸起按钮
  text: 'text', // 文本按钮
  outlined: 'outlined', // 边框按钮
};

// Flutter 按钮尺寸枚举
export const ButtonSize = {
  small: 'small',
  medium: 'medium',
  large: 'large',
};

const Button = ({
  // Flutter 核心属性
  onPressed, // 点击事件（Flutter 命名）
  child, // 子元素（Flutter 风格）
  children,
  text, // 快捷文本（替代 child）
  type = ButtonType.elevated, // 默认凸起按钮
  size = ButtonSize.medium,
  color, // 主色（按钮背景/文字/边框）
  disabled = false,
  borderRadius = 8, // 圆角（Flutter 默认8）
  padding, // 自定义内边距
  // 扩展属性
  style,
  className,
  icon, // 左侧图标
}) => {
  const content = child || children || text;
  const isDisabled = disabled || !onPressed;

  // 尺寸映射（匹配 Flutter 按钮默认尺寸）
  const sizeConfig = {
    [ButtonSize.small]: {
      height: 32,
      fontSize: 14,
      padding: '0 12px',
    },
    [ButtonSize.medium]: {
      height: 44,
      fontSize: 16,
      padding: '0 16px',
    },
    [ButtonSize.large]: {
      height: 56,
      fontSize: 18,
      padding: '0 20px',
    },
  };
  const currentSize = sizeConfig[size];

  // 颜色默认值（匹配 Flutter 主题）
  const defaultColor = '#007aff'; // iOS 风格主色
  const btnColor = color || defaultColor;

  // 按钮基础样式
  const baseStyle = {
    height: currentSize.height,
    fontSize: currentSize.fontSize,
    padding: padding || currentSize.padding,
    borderRadius,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
    ...style,
  };

  // 原生拼接类名（替代 clsx）
  const getCombinedClassName = () => {
    const classList = [
      styles.button,
      styles[`button-${type}`], // 按钮类型样式
      className || '', // 外部自定义类名
      isDisabled ? styles.disabled : '' // 禁用状态样式
    ];
    // 过滤空值并拼接
    return classList.filter(Boolean).join(' ');
  };

  return (
    <button
      className={getCombinedClassName()}
      style={{
        ...baseStyle,
        // 动态颜色（不同按钮类型适配）
        '--btn-color': btnColor,
        // 补充 RGB 变量（解决样式中 var(--btn-color-rgb) 报错）
        '--btn-color-rgb': hexToRgb(btnColor),
      }}
      onClick={!isDisabled ? onPressed : undefined}
      disabled={isDisabled}
    >
      {/* 图标 + 文本布局（Flutter 风格） */}
      <div className={styles.buttonContent}>
        {icon && <span className={styles.buttonIcon}>{icon}</span>}
        <span className={styles.buttonText}>{content}</span>
      </div>
    </button>
  );
};

// 辅助函数：16进制颜色转RGB（适配样式中的 var(--btn-color-rgb)）
const hexToRgb = (hex) => {
  // 去除 # 号
  const cleanHex = hex.replace(/^#/, '');
  // 解析 RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
};

export default Button;