import React from 'react';
import styles from './Border.module.css';

/**
 * Border - 强化视觉适配版
 */
export const Border = ({ 
  type = 'all', 
  thickness = 1.5, // 默认稍微加厚
  opacity = 0.8,   // 默认高透明度，确保可见
  glow = true      // 默认开启主题呼吸感
}) => {
  return (
    <div 
      className={styles.border} 
      data-type={type}
      data-glow={glow}
      style={{ 
        '--b-thickness': `${thickness}px`,
        '--b-opacity': opacity,
      }}
    />
  );
};