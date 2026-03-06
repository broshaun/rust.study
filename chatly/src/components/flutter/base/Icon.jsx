import React from 'react';

const SVG_BASE_URL = 'static/svg/';

export const Icon = ({
  name,
  size = 24,
  label = '',
  labelPos = 'bottom',
  // 保持变量引用，但去掉冗余的 filter 和 scale 逻辑
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
        display: 'inline-flex',
        flexDirection: labelPos === 'bottom' ? 'column' : 'row',
        alignItems: 'center',
        gap: '6px',
        cursor: onClick ? 'pointer' : 'default',
        verticalAlign: 'middle',
        ...style
      }}
    >
      <i style={{
        width: size,
        height: size,
        backgroundColor: currentColor, 
        WebkitMask: `url(${SVG_BASE_URL}${name}.svg) no-repeat center / contain`,
        mask: `url(${SVG_BASE_URL}${name}.svg) no-repeat center / contain`,
        display: 'inline-block',
        flexShrink: 0
      }} />
      {label && (
        <span style={{ fontSize: '14px', color: currentColor, lineHeight: 1 }}>
          {label}
        </span>
      )}
    </div>
  );
};