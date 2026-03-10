import React from 'react';
import styles from './Divider.module.css';

/**
 * Divider - 纯净分割线
 * @param {boolean} fade - 是否开启两端渐隐
 * @param {number} spacing - 上下的留白间距 (默认 16px)
 * @param {boolean} bleed - 是否无视父级 padding，强制撑满整个容器边缘
 */
export const Divider = ({ fade = false, spacing = 10, bleed = false }) => {
  return (
    <div 
      className={`
        ${styles.divider} 
        ${fade ? styles.fade : ''} 
        ${bleed ? styles.bleed : ''}
      `}
      style={{ 
        '--div-spacing': `${spacing}px` 
      }}
    />
  );
};