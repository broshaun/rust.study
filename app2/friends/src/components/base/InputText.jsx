import React, { useRef, useEffect } from 'react';
import { IconItem } from '../icon';
import styles from './InputText.module.css';

export const InputText = ({
  type = "text",
  label,
  icon,
  placeholder = '',
  defaultValue = '',
  onChange,
  maxLength,
  onChangeValue,
  error = false,
}) => {
  const labelRef = useRef(null);
  const containerRef = useRef(null);

  // 优化：确保滚动条加载完成后再计算 Label 宽度，避免初始计算偏差
  useEffect(() => {
    // 延迟执行，等待滚动条、布局完全渲染完成
    const timer = setTimeout(() => {
      if (labelRef.current && containerRef.current) {
        const labelWidth = labelRef.current.offsetWidth;
        // 直接设置 Label 宽度，不依赖容器宽度，避免滚动条干扰
        containerRef.current.style.setProperty('--label-width', `${labelWidth}px`);
      }
    }, 100); // 短暂延迟，确保布局稳定

    return () => clearTimeout(timer); // 清除定时器，避免内存泄漏
  }, [label, error]); // 依赖 label 和 error，确保变化时重新计算

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (typeof onChange === 'function') {
      onChange(e);
    }
    if (typeof onChangeValue === 'function') {
      onChangeValue(inputValue);
    }
  };

  // 拼接 Module CSS 类名，确保布局优先级
  const containerClasses = [
    styles.inputContainer,
    label ? styles.labeled : '',
    icon ? styles.iconLeft : '',
    error ? styles.error : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} ref={containerRef}>
      {label && (
        <label className={styles.inputLabel} ref={labelRef}>
          {label}
        </label>
      )}

      {icon && (
        <i className={styles.icon}>
          <IconItem name={icon} size={24} />
        </i>
      )}

      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={handleInputChange}
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
};