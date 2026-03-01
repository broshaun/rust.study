import React, { useRef, useEffect } from '.store/react@18.3.1/node_modules/react';
import { IconItem } from '../icon';
import styles from './InputText.module.css';

export const InputText = ({
  type = "text",
  label,          // 左侧标签
  right_label,    // 右侧标签
  icon,           // 左侧图标
  right_icon,     // 右侧图标
  right_icon_onClick, // 新增：右侧图标点击事件
  placeholder = '',
  defaultValue = '',
  onChange,
  maxLength,
  onChangeValue,
  error = false,
  disabled = false, // 新增：禁用状态（用于控制图标点击）
}) => {
  const labelRef = useRef(null);
  const rightLabelRef = useRef(null);
  const containerRef = useRef(null);

  // 计算标签宽度
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        // 左侧标签宽度
        if (labelRef.current) {
          const labelWidth = labelRef.current.offsetWidth;
          containerRef.current.style.setProperty('--label-width', `${labelWidth}px`);
        }
        // 右侧标签宽度
        if (rightLabelRef.current) {
          const rightLabelWidth = rightLabelRef.current.offsetWidth;
          containerRef.current.style.setProperty('--right-label-width', `${rightLabelWidth}px`);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [label, right_label, error]);

  // 输入框变化处理
  const handleInputChange = (e) => {
    if (disabled) return; // 禁用状态不处理输入
    const inputValue = e.target.value;
    if (typeof onChange === 'function') {
      onChange(e);
    }
    if (typeof onChangeValue === 'function') {
      onChangeValue(inputValue);
    }
  };

  // 新增：右侧图标点击事件处理
  const handleRightIconClick = (e) => {
    // 阻止事件冒泡到输入框，避免触发输入框焦点变化
    e.stopPropagation();
    if (disabled || !right_icon_onClick) return; // 禁用/无事件时不执行
    right_icon_onClick(e);
  };

  // 容器类名（新增disabled类名）
  const containerClasses = [
    styles.inputContainer,
    label ? styles.labeled : '',
    right_label ? styles.rightLabeled : '',
    icon ? styles.iconLeft : '',
    right_icon ? styles.iconRight : '',
    error ? styles.error : '',
    disabled ? styles.disabled : '' // 新增禁用类名
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} ref={containerRef}>
      {/* 左侧标签 */}
      {label && (
        <label className={styles.inputLabel} ref={labelRef}>
          {label}
        </label>
      )}

      {/* 左侧图标 */}
      {icon && (
        <i className={`${styles.icon} ${styles.iconLeft}`}>
          <IconItem name={icon} size={24} />
        </i>
      )}

      {/* 输入框核心 */}
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={handleInputChange}
        autoComplete="off"
        spellCheck="false"
        disabled={disabled} // 绑定禁用状态
      />

      {/* 右侧图标（新增点击事件） */}
      {right_icon && (
        <i 
          className={`${styles.icon} ${styles.iconRight}`}
          onClick={handleRightIconClick} // 绑定点击事件
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }} // 鼠标样式
        >
          <IconItem name={right_icon} size={24} />
        </i>
      )}

      {/* 右侧标签 */}
      {right_label && (
        <label className={`${styles.inputLabel} ${styles.rightInputLabel}`} ref={rightLabelRef}>
          {right_label}
        </label>
      )}
    </div>
  );
};