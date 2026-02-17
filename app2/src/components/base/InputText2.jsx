import React, { Children, isValidElement } from 'react';
import { IconItem } from '../icon';
import styles from './InputText2.module.css';

// 定义子组件
const Left = ({ label, icon }) => null;
const Right = ({ label, icon, onClick }) => null;

// 核心 InputText2 组件（新增 value 支持受控模式）
const InputText2 = ({
  type = "text",
  placeholder = '',
  defaultValue = '',
  // 新增：受控模式 value（优先级高于 defaultValue）
  value,
  onChangeValue,
  maxLength,
  error = false,
  disabled = false,
  children,
  position = 'left',
  size = 'medium'
}) => {
  // 解析子组件 props
  const parseChildren = () => {
    const result = {
      left: { label: '', icon: '' },
      right: { label: '', icon: '', onClick: null }
    };

    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        if (child.type === Left) {
          result.left = { ...child.props };
        }
        if (child.type === Right) {
          result.right = { ...child.props };
        }
      }
    });
    return result;
  };

  const { left: leftProps, right: rightProps } = parseChildren();
  const isRightIconInteractive = !!rightProps.icon && typeof rightProps.onClick === 'function' && !disabled;

  // 输入框变化处理
  const handleInputChange = (e) => {
    if (disabled || !onChangeValue) return;
    onChangeValue(e.target.value);
  };

  // 右侧图标点击处理
  const handleIconClick = (e) => {
    e.stopPropagation();
    if (disabled || !rightProps.onClick) return;
    rightProps.onClick(e);
  };

  // 容器类名
  const containerClasses = [
    styles.inputContainer,
    styles[`size-${size}`],
    styles[`position-${position}`],
    error && styles.error,
    disabled && styles.disabled,
    (leftProps.label || leftProps.icon) && styles.hasLeft,
    (rightProps.label || rightProps.icon) && styles.hasRight,
    isRightIconInteractive && styles.iconInteractive
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* 左侧内容 */}
      {(leftProps.label || leftProps.icon) && (
        <div className={`${styles.sideContainer} ${styles.leftContainer}`}>
          {leftProps.label && <span className={styles.label}>{leftProps.label}</span>}
          {leftProps.icon && (
            <div className={styles.icon}>
              <IconItem name={leftProps.icon} size={24} />
            </div>
          )}
        </div>
      )}

      {/* 输入框：新增 value 受控属性（优先级高于 defaultValue） */}
      <input
        className={styles.input}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        // 核心：受控模式用 value，非受控用 defaultValue
        value={value !== undefined ? value : undefined}
        maxLength={maxLength}
        onChange={handleInputChange}
        disabled={disabled}
        autoComplete="off"
        spellCheck="false"
      />

      {/* 右侧内容 */}
      {(rightProps.label || rightProps.icon) && (
        <div className={`${styles.sideContainer} ${styles.rightContainer}`}>
          {rightProps.icon && (
            <div 
              className={styles.icon}
              onClick={isRightIconInteractive ? handleIconClick : undefined}
              style={{ cursor: isRightIconInteractive ? 'pointer' : 'default' }}
            >
              <IconItem name={rightProps.icon} size={24} />
            </div>
          )}
          {rightProps.label && (
            <span className={styles.label} style={{ cursor: 'default' }}>
              {rightProps.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// 挂载子组件
InputText2.Left = Left;
InputText2.Right = Right;

export default InputText2;