
import React from 'react';
import { IconSvg } from './IconSvg';
import './IconItem.css';

/**
 * 带样式的SVG图标组件（仅默认灰色）
 * @param {string} name - 图标名称（同IconSvg）
 * @param {number} size - 图标大小（默认24）
 */
export const IconItem = ({
  name,
  size = 24,
}) => {
  return (
    <div className="svg-icon-container" >
      <IconSvg name={name} size={size} />
    </div>
  );
};
