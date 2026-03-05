import React from 'react';
import styles from './Button.module.css';

/**
 * Flutter 风格精简按钮
 * @param {string} label - 按钮显示的文字
 * @param {string|number} width - 宽度 (如 "70%" 或 200)
 */
export const Button = ({ 
  onPressed, 
  label, 
  size = 'medium', 
  color = '#eeeeee', 
  width,
  disabled = false 
}) => {
  
  const classNames = [
    styles.button,
    styles[`size-${size}`],
    disabled ? styles.disabled : ''
  ].join(' ');

  const buttonStyle = {
    '--btn-color': color,
    width: typeof width === 'number' ? `${width}px` : width
  };

  return (
    <button
      className={classNames}
      style={buttonStyle}
      onClick={!disabled ? onPressed : undefined}
      disabled={disabled}
    >
      {label}
    </button>
  );
};