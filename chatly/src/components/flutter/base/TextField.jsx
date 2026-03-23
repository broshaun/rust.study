import React from "react";
// 建议保留 CSS Modules，或者将样式写在 style 对象中以减少依赖
import styles from './TextField.module.css';

/**
 * TextField - 原生高度定制版
 * 适配自定义皮肤变量与横向布局
 */
export const TextField = ({ 
  label, 
  hintText, 
  value, 
  onChanged, 
  maxWidth, 
  obscureText = false,
  disabled = false,
  error // 新增：错误状态支持
}) => {
  
  const containerStyle = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    // 如果有错误，动态改变边框色
    ...(error ? { borderColor: 'var(--mantine-color-red-filled)', borderWidth: '1.5px' } : {})
  };

  return (
    <div className={styles.inputContainer} style={containerStyle} data-disabled={disabled}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        <input
          className={styles.input}
          type={obscureText ? 'password' : 'text'}
          placeholder={hintText}
          value={value ?? ''}
          onChange={(e) => onChanged?.(e.target.value)}
          disabled={disabled}
          spellCheck={false}
        />
      </div>
    </div>
  );
};