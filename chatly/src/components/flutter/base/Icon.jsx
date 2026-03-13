import React from 'react';

const SVG_BASE_URL = 'static/svg/';

/**
 * Icon - 稳健版 + 红点角标
 * 支持：
 * dot -> 小红点
 * badge -> 数字
 * badgeContent -> 自定义内容
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
  style,

  // ===== 新增参数 =====
  dot = false,
  badge = null,
  badgeContent = null
}) => {

  const currentColor = active ? activeColor : color;

  const showBadge = dot || badge !== null || badgeContent !== null;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        flexDirection: labelPos === 'bottom' ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: 'auto',
        height: 'auto',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-speed, 0.3s) ease',
        ...style
      }}
    >

      {/* 图标 + 红点容器 */}
      <div style={{ position: 'relative', display: 'inline-block' }}>

        <i
          style={{
            width: typeof size === 'number' ? `${size}px` : size,
            height: typeof size === 'number' ? `${size}px` : size,
            backgroundColor: currentColor,
            WebkitMask: `url(${SVG_BASE_URL}${name}.svg) no-repeat center / contain`,
            mask: `url(${SVG_BASE_URL}${name}.svg) no-repeat center / contain`,
            display: 'inline-block',
            flexShrink: 0,
            WebkitMaskSize: 'contain',
            maskSize: 'contain'
          }}
        />

        {showBadge && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '8px',
              height: '8px',
              padding: badge || badgeContent ? '0 4px' : 0,
              background: '#ff3b30',
              color: '#fff',
              fontSize: '10px',
              lineHeight: '14px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translate(50%, -50%)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}
          >
            {badgeContent || (badge > 99 ? '99+' : badge)}
          </span>
        )}

      </div>

      {label && (
        <span
          style={{
            fontSize: '12px',
            color: currentColor,
            lineHeight: 1,
            fontWeight: active ? '600' : 'normal'
          }}
        >
          {label}
        </span>
      )}

    </div>
  );
};