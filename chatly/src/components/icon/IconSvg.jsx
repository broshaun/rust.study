import React, { useCallback } from 'react';

/**
 * 自定义SVG图标基础组件（仅数字控制大小）
 * @param {string} cssId - 外部自定义ID
 * @param {string} name - 图标名称（匹配内置URL映射）
 * @param {number} size - 图标大小（数字转px，默认24）
 */
export const IconSvg = ({
  cssId,
  name,
  size = 24,
}) => {
  const iconSize = `${Number(size)}px`;
  const containerStyle = {
    width: iconSize,
    height: iconSize,
  };

  const fnSrc = useCallback((name) => {
    return `static/svg/${name}.svg`;
  }, [])

  return (
    <div id={cssId} style={containerStyle}>
      <img
        src={fnSrc(name)}
        alt={`${name}图标`}
        decoding="async"
        loading="lazy"
        className="svg-icon-img"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
};