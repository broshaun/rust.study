import React from 'react';
import styles from './Button.module.css';

/**
 * Button - 万能风格适配版
 * 职责：接入全局皮肤系统。
 */
export const Button = ({ 
  onPressed, 
  label, 
  size = 'medium', 
  width,
  disabled = false,
  style 
}) => {
  
  const classNames = [
    styles.button,
    styles[`size-${size}`],
    disabled ? styles.disabled : ''
  ].join(' ');

  return (
    <button
      className={classNames}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        ...style 
      }}
      onClick={!disabled ? onPressed : undefined}
      disabled={disabled}
    >
      {label}
    </button>
  );
};