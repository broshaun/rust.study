import React from 'react';
import styles from './Avatar.module.css';

/**
 * 通用头像组件
 * @param {object} props
 * @param {string} props.src - 头像图片地址
 * @param {string} props.alt - 图片替代文本（无障碍必备）
 * @param {number} [props.size=60] - 头像大小（宽高一致，单位px）
 * @param {string} [props.shape='circle'] - 形状：circle（圆形）/square（方形）
 * @param {string} [props.className] - 自定义类名
 * @param {string} [props.borderColor='#f0f0f0'] - 边框颜色
 * @param {boolean} [props.hasShadow=true] - 是否显示轻微阴影
 * @param {React.CSSProperties} [props.style] - 自定义内联样式
 * @returns {React.ReactElement}
 */
const Avatar = ({
  src,
  alt = '头像',
  size = 60,
  shape = 'circle',
  className,
  borderColor = '#f0f0f0',
  hasShadow = true,
  style = {},
}) => {
  // 内部实现类名拼接逻辑（替代外部cx工具）
  // 过滤空值，将多个类名拼接成字符串
  const combineClassNames = (...classNames) => {
    return classNames.filter(Boolean).join(' ');
  };

  // 核心样式：大小 + 形状 + 边框颜色
  const avatarStyles = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: shape === 'circle' ? '50%' : '8px', // 圆形/方形圆角
    borderColor,
    boxShadow: hasShadow ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
    ...style,
  };

  return (
    <img
      src={src}
      alt={alt}
      // 使用内部函数拼接类名
      className={combineClassNames(styles.avatar, className)}
      style={avatarStyles}
      // 图片加载失败时的兜底处理
      onError={(e) => {
        e.target.src = 'https://picsum.photos/200/200'; // 兜底图片
        e.target.alt = '默认头像';
      }}
    />
  );
};

export default Avatar;