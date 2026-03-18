import React from "react";
import styles from './TextField.module.css';

/**
 * TextField - 皮肤适配版
 * 添加 maxWidth 支持，并优化了字体渲染
 */
export const TextField = ({ 
  label, 
  hintText, 
  value, 
  onChanged, 
  maxWidth, // 新增：支持传入数字或字符串
  obscureText = false 
}) => {
  // 处理宽度逻辑
  const containerStyle = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth
  };

  return (
    <div className={styles.inputContainer} style={containerStyle}>
      {label && <div className={styles.label}>{label}</div>}
      
      <input
        className={styles.input}
        type={obscureText ? 'password' : 'text'}
        placeholder={hintText}
        value={value ?? ''}
        onChange={(e) => onChanged?.(e.target.value)}
      />
    </div>
  );
};