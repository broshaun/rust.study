import React from 'react';
import { IconSvg } from './IconSvg';
import './IconItemHoverScale.css';

/**
 * 悬浮变原色+放大的SVG图标组件（带文字标签：下方/右侧）
 * @param {string} name - 图标名称（同IconSvg）
 * @param {number} size - 图标基础大小（默认24）
 * @param {number} scaleRatio - 悬浮放大比例（默认1.3，可选）
 * @param {string} id - 容器ID（可选）
 * @param {Function} onClick - 点击事件回调（可选）
 * @param {string} label - 标签文本（可选，不传则不显示标签）
 * @param {string} labelPosition - 标签位置（bottom：下方/right：右侧，默认bottom）
 */
export const IconItemHoverScale = ({
  name,
  size = 24,
  scaleRatio = 1.3,
  id = '',
  onClick,
  label = '',
  labelPosition = 'bottom',
}) => {
  // 容器样式（传递放大比例、图标大小）
  const containerStyle = {
    '--icon-size': `${size}px`,
    '--scale-ratio': scaleRatio,
  };

  // 处理点击事件（兼容不可点击状态）
  const handleClick = (e) => {
    const isDisabled = e.currentTarget.parentElement?.style?.cursor === 'default';
    if (onClick && !isDisabled) {
      onClick(e);
    }
  };

  // 判定标签位置是否合法（仅支持 bottom/right）
  const isValidPosition = ['bottom', 'right'].includes(labelPosition);

  return (
    <div 
      id={id} 
      // 动态绑定容器类名（包含标签位置）
      className={`icon-item-wrap ${isValidPosition ? `label-${labelPosition}` : 'label-bottom'} ${!!label ? 'has-label' : ''}`}
      style={containerStyle}
      onClick={handleClick}
    >
      {/* 原有图标容器 */}
      <div className="svg-icon-hover-scale-container">
        <IconSvg name={name} size={size} />
      </div>

      {/* 文字标签（有label才显示） */}
      {!!label && (
        <span className="icon-item-label">
          {label}
        </span>
      )}
    </div>
  );
};