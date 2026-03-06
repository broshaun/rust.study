import React from 'react';

/**
 * Divider - 满宽渐隐版
 * 职责：占据 100% 宽度，但视觉上通过渐变实现两端消失，中间厚实。
 */
export const Divider = ({ 
  height = 20,        
  thickness = 1,      
  style               
}) => {
  // 核心：使用 text-primary 变量确保可见性，透明度由渐变控制
  const color = 'var(--text-primary, #666)';

  return (
    <div style={{
      height: `${height}px`,
      width: '100%', // 满宽度
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
      ...style
    }}>
      <div style={{
        width: '100%',
        height: `${thickness}px`,
        /**
         * 关键：满宽渐变逻辑
         * 0% (透明) -> 15% (开始显现) -> 50% (最实) -> 85% (开始消失) -> 100% (透明)
         */
        background: `linear-gradient(to right, 
          transparent 0%, 
          ${color} 50%, 
          transparent 100%)`,
        
        // 降低整体基础透明度，使其看起来更像“折射”而非“画线”
        opacity: 0.25,
        
        // 增加立体高光层（在深色背景/金属背景下尤为明显）
        boxShadow: '0px 1px 0px rgba(255, 255, 255, 0.1)',
        
        transition: 'all 0.4s ease'
      }} />
    </div>
  );
};