import React, { Children, isValidElement } from 'react';
import { IconItem } from '../icon';
import styles from './InputText2.module.css';

// 定义子组件
const Left = ({ label, icon }) => null;
const Right = ({ label, icon, onClick }) => null;

const InputText2 = ({
  type = "text",
  placeholder = '',
  defaultValue = '',
  value,
  onChangeValue,
  maxLength,
  error = false,
  disabled = false,
  children,
  position = 'left',
  size = 'medium'
}) => {
  const parseChildren = () => {
    const result = {
      left: { label: '', icon: '' },
      right: { label: '', icon: '', onClick: null }
    };

    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        if (child.type === Left) result.left = { ...child.props };
        if (child.type === Right) result.right = { ...child.props };
      }
    });
    return result;
  };

  const { left: leftProps, right: rightProps } = parseChildren();

  // ✅ 核心：Right 是否可点击，只看 onClick（不依赖 icon）
  const isRightInteractive = typeof rightProps.onClick === 'function' && !disabled;

  const handleInputChange = (e) => {
    if (disabled || !onChangeValue) return;
    onChangeValue(e.target.value);
  };

  // ✅ 点击整个 Right 区域
  const handleRightClick = (e) => {
    e.stopPropagation();
    if (!isRightInteractive) return;
    rightProps.onClick(e);
  };

  const containerClasses = [
    styles.inputContainer,
    styles[`size-${size}`],
    styles[`position-${position}`],
    error && styles.error,
    disabled && styles.disabled,
    (leftProps.label || leftProps.icon) && styles.hasLeft,
    (rightProps.label || rightProps.icon) && styles.hasRight,
    isRightInteractive && styles.rightInteractive
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

      <input
        className={styles.input}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value !== undefined ? value : undefined}
        maxLength={maxLength}
        onChange={handleInputChange}
        disabled={disabled}
        autoComplete="off"
        spellCheck="false"
      />

      {/* ✅ 右侧内容：整个容器可点击 */}
      {(rightProps.label || rightProps.icon) && (
        <div
          className={`${styles.sideContainer} ${styles.rightContainer}`}
          onClick={isRightInteractive ? handleRightClick : undefined}
          style={{ cursor: isRightInteractive ? 'pointer' : 'default' }}
        >
          {rightProps.icon && (
            <div className={styles.icon} style={{ pointerEvents: 'none' }}>
              <IconItem name={rightProps.icon} size={24} />
            </div>
          )}
          {rightProps.label && (
            <span className={styles.label} style={{ pointerEvents: 'none' }}>
              {rightProps.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

InputText2.Left = Left;
InputText2.Right = Right;

export default InputText2;
