import React from 'react';
import styles from './TextField.module.css';

/**
 * Flutter 风格一体化输入框
 * @param {string} label - 内部左侧标签
 * @param {boolean} obscureText - 是否加密显示 (密码模式)
 */
export const TextField = ({ 
  label, 
  hintText, 
  value, 
  onChanged, 
  obscureText = false, 
  width = '100%',
  color = '#2196F3',
  disabled = false 
}) => {
  
  const containerStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    '--primary-color': color
  };

  return (
    <div 
      className={`${styles.inputContainer} ${disabled ? styles.disabled : ''}`} 
      style={containerStyle}
    >
      {/* 1. 左侧标签区 */}
      {label && (
        <div className={styles.leftLabel}>
          {label}
        </div>
      )}

      {/* 2. 输入区：根据 obscureText 切换类型 */}
      <input
        className={styles.input}
        type={obscureText ? 'password' : 'text'}
        placeholder={hintText}
        value={value}
        disabled={disabled}
        onChange={(e) => onChanged && onChanged(e.target.value)}
      />
    </div>
  );
};