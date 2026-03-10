import React from 'react';

const SVG_BASE_URL = 'static/svg/';

/**
 * Icon - 稳健版
 * 优化点：改为 inline-flex 且去掉宽高 100%，确保不侵占父级空间。
 */
export const Icon = ({
  name,
  size = 24,
  label = '',
  labelPos = 'bottom',
  color = 'var(--text-secondary, #666)', 
  activeColor = 'var(--accent-color, #007aff)',
  active = false,
  onClick,
  style
}) => {
  const currentColor = active ? activeColor : color;

  return (
    <div 
      onClick={onClick}
      style={{
        // 1. 改为 inline-flex，宽度高度随内容自适应
        display: 'inline-flex', 
        flexDirection: labelPos === 'bottom' ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        // 2. 去掉 100%，防止霸占 Row.Col 的地盘
        width: 'auto',
        height: 'auto',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-speed, 0.3s) ease',
        ...style
      }}
    >
      <i style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        backgroundColor: currentColor, 
        // 3. 保持内联 Mask 路径，确保 100% 加载成功
        WebkitMask: `url(${SVG_BASE_URL}${name}.svg) no-repeat center / contain`,
        mask: `url(${SVG_BASE_URL}${name}.svg) no-repeat center / contain`,
        display: 'inline-block',
        flexShrink: 0,
        WebkitMaskSize: 'contain',
        maskSize: 'contain'
      }} />
      
      {label && (
        <span style={{ 
          fontSize: '12px', 
          color: currentColor, 
          lineHeight: 1,
          fontWeight: active ? '600' : 'normal'
        }}>
          {label}
        </span>
      )}
    </div>
  );
};