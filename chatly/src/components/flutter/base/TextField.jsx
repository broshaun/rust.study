import React from 'react';
import styles from './TextField.module.css';

/**
 * TextField - 万能风格适配版
 * 职责：接入全局皮肤系统，支持 7 种主题一键变脸。
 */
export const TextField = ({ 
  label, 
  hintText, 
  value, 
  onChanged, 
  obscureText = false, 
  width = '100%',
  disabled = false,
  style
}) => {
  
  return (
    <div 
      className={`${styles.inputContainer} ${disabled ? styles.disabled : ''}`} 
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        ...style 
      }}
    >
      {label && (
        <div className={styles.leftLabel}>
          {label}
        </div>
      )}

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