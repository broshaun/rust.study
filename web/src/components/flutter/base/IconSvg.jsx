import React from 'react';

/**
 * @name IconSvg
 * @description 极致精简的 SVG 图标组件，适配 Rsbuild 路径与 Flex 布局
 * @param {string} cssId - 外部自定义 ID，用于特殊样式钩子
 * @param {string} name - SVG 文件名（存放于 static/svg/ 目录）
 * @param {number} size - 图标边长（数字，单位 px，默认 24）
 */
export const IconSvg = ({ cssId, name, size = 24 }) => {
  const side = `${size}px`;

  return (
    <div 
      id={cssId} 
      style={{ 
        width: side, 
        height: side, 
        flexShrink: 0, // 强制锁死尺寸，防止在 Flex 容器中被挤压
        display: 'inline-block' 
      }}
    >
      <img
        src={`static/svg/${name}.svg`}
        alt={name}
        decoding="async" // 异步解码，不阻塞主线程渲染
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block', // 消除行内元素间隙
          objectFit: 'contain' // 保持 SVG 比例
        }}
      />
    </div>
  );
};