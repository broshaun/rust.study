import React from 'react';
import styles from './TextField.module.css';

/**
 * TextField - 皮肤适配版 (融合增强)
 * 职责：纯粹的输入桥接器，处理 Label 与 Input 的水平排列。
 */
export const TextField = ({ 
  label, 
  hintText, 
  value, 
  onChanged, 
  obscureText = false 
}) => {
  return (
    <div className={styles.inputContainer}>
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