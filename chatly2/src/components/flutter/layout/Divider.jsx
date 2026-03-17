import React from "react";
import styles from './Divider.module.css';

/**
 * Divider - 纯净分割线
 * 职责：提供视觉分层，完美适配多主题光影效果。
 * * @param {Object} props
 * @param {boolean} [props.fade=false] - 是否开启两端渐隐效果
 * @param {number} [props.spacing=10] - 上下的留白间距 (单位: px)
 * @param {boolean} [props.bleed=false] - 是否无视父级 padding 强制撑满左右边缘
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