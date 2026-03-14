import React from 'react';

const SVG_BASE_URL = 'static/svg/';

/**
 * Icon - 稳健版 + 红点角标
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

  dot = false,
  badge = null,
  badgeContent = null
}) => {

  const currentColor = active ? activeColor : color;

  // 0 不显示
  const validBadge =
    badgeContent !== null && badgeContent !== undefined && badgeContent !== 0
      ? badgeContent
      : (badge !== null && badge !== 0 ? badge : null);

  const showBadge = dot || validBadge !== null;

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
      {/* 图标容器 */}
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
              minWidth: validBadge ? '16px' : '8px',
              height: validBadge ? '16px' : '8px',
              padding: validBadge ? '0 4px' : 0,
              background: '#ff3b30',
              color: '#fff',
              fontSize: '10px',
              lineHeight: '16px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translate(50%, -50%)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}
          >
            {validBadge !== null ? (validBadge > 99 ? '99+' : validBadge) : null}
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