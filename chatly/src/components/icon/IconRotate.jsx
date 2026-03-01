import React from '.store/react@18.3.1/node_modules/react';
import { IconSvg } from './IconSvg';
import './IconRotate.css';

/**
 * 带默认缓慢旋转效果的SVG加载图标组件（默认灰色）
 * @param {string} name - 图标名称（同IconSvg）
 * @param {number} size - 图标大小（默认24）
 * @param {number} rotateDuration - 旋转一圈的时长（秒，默认2，值越大转得越慢）
 */
export const IconRotate = ({
  name,
  size = 24,
  rotateDuration = 2,
}) => {
  return (
    <div 
      className="svg-rotate-container"
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        // 动态设置旋转动画时长
        '--rotate-duration': `${rotateDuration}s` 
      }}
    >
      <IconSvg name={name} size={size} />
    </div>
  );
};