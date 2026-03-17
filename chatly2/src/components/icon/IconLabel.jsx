import React from "react";
import { IconSvg } from './IconSvg'; // 导入你的 IconSvg 组件

/**
 * 图标+文字组合组件
 * @param {string} name - 图标名称（对应 static/svg/[name].svg）
 * @param {number} size - 图标大小（默认24px）
 * @param {string} label - 显示的文字标签
 * @param {'right' | 'bottom'} labelPosition - 标签位置：right（右边）/bottom（下边）
 * @param {string} cssId - 图标容器自定义ID（透传至 IconSvg）
 * @param {object} style - 组件根容器自定义样式
 * @param {object} labelStyle - 标签文字自定义样式
 */
export const IconLabel = ({
  name,
  size = 24,
  label,
  labelPosition = 'bottom', // 默认标签在图标下方
  cssId,
  style = {},
  labelStyle = {},
}) => {
  // 基础样式
  const baseContainerStyle = {
    display: labelPosition === 'right' ? 'flex' : 'flex-col', // 根据位置切换布局
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // 图标和文字间距
    ...style, // 合并自定义样式
  };

  // 标签基础样式
  const baseLabelStyle = {
    fontSize: 14,
    color: '#666666',
    userSelect: 'none', // 禁止文字选中
    ...labelStyle, // 合并自定义标签样式
  };

  return (
    <div style={baseContainerStyle}>
      {/* 引用你的 IconSvg 组件 */}
      <IconSvg
        cssId={cssId}
        name={name}
        size={size}
      />
      {/* 显示文字标签（有值才渲染） */}
      {label && (
        <span style={baseLabelStyle}>
          {label}
        </span>
      )}
    </div>
  );
};