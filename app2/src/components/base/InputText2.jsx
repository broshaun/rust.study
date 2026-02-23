import React, { Children, isValidElement, useMemo, useRef, useLayoutEffect } from 'react';
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
  size = 'medium',

  // 宽度配置（支持数字/字符串，如 600 / '600px' / '80%'）
  autoFit = false,
  minWidth = 200,
  maxWidth = 520,
  extraWidth = 28,
  width, // 新增：手动设置固定宽度
}) => {
  const mirrorRef = useRef(null);
  const inputRef = useRef(null);

  // 处理宽度值（统一转为 px 或百分比）
  const getWidthValue = (val) => {
    if (typeof val === 'number') return `${val}px`;
    if (typeof val === 'string' && (val.endsWith('px') || val.endsWith('%'))) return val;
    return `${val}px`; // 兜底转为 px
  };

  // 容器样式：透传宽度配置
  const containerStyle = useMemo(() => {
    const style = {};
    // 优先使用手动宽度
    if (width) style.width = getWidthValue(width);
    // 最小宽度
    if (minWidth) style.minWidth = getWidthValue(minWidth);
    // 最大宽度
    if (maxWidth) style.maxWidth = getWidthValue(maxWidth);
    return style;
  }, [width, minWidth, maxWidth]);

  const parseChildren = () => {
    const result = {
      left: { label: '', icon: '' },
      right: { label: '', icon: '', onClick: null }
    };

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      if (child.type === Left) result.left = { ...child.props };
      if (child.type === Right) result.right = { ...child.props };
    });

    return result;
  };

  const { left: leftProps, right: rightProps } = parseChildren();
  const isRightInteractive = typeof rightProps.onClick === 'function' && !disabled;

  const handleInputChange = (e) => {
    if (disabled || !onChangeValue) return;
    onChangeValue(e.target.value);
  };

  const handleRightClick = (e) => {
    e.stopPropagation();
    if (!isRightInteractive) return;
    rightProps.onClick(e);
  };

  const displayText = useMemo(() => {
    const v = value !== undefined ? value : defaultValue;
    return (v ?? '').toString();
  }, [value, defaultValue]);

  // 自动适应宽度逻辑：仅在 autoFit=true 且无手动 width 时生效
  useLayoutEffect(() => {
    if (!autoFit || width) return; // 有手动宽度时，禁用自动适应
    if (!mirrorRef.current || !inputRef.current) return;

    const text = displayText.length ? displayText : (placeholder || '');
    mirrorRef.current.textContent = text;

    // 计算宽度时，强制遵守 minWidth/maxWidth
    const measured = mirrorRef.current.offsetWidth + extraWidth;
    const minVal = typeof minWidth === 'number' ? minWidth : parseInt(minWidth) || 200;
    const maxVal = typeof maxWidth === 'number' ? maxWidth : parseInt(maxWidth) || 520;
    const nextWidth = Math.max(minVal, Math.min(maxVal, measured));

    inputRef.current.style.width = `${nextWidth}px`;
  }, [autoFit, displayText, placeholder, minWidth, maxWidth, extraWidth, width]);

  const containerClasses = [
    styles.inputContainer,
    typeof size === 'string' && styles[`size-${size}`],
    styles[`position-${position}`],
    error && styles.error,
    disabled && styles.disabled,
    (leftProps.label || leftProps.icon) && styles.hasLeft,
    (rightProps.label || rightProps.icon) && styles.hasRight,
    isRightInteractive && styles.iconInteractive
  ].filter(Boolean).join(' ');

  const mirrorFontSize =
    typeof size === 'string'
      ? (size === 'small' ? 14 : size === 'large' ? 18 : 16)
      : 16;

  return (
    <div className={containerClasses} style={containerStyle}> {/* 关键：添加 style 透传 */}
      {autoFit && (
        <span
          ref={mirrorRef}
          className={styles.mirror}
          style={{
            fontSize: mirrorFontSize,
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            letterSpacing: 'inherit',
            padding: 0,
          }}
        />
      )}

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
        ref={inputRef}
        className={`${styles.input} ${autoFit ? styles.autoFitInput : ''}`}
        type={type}
        placeholder={placeholder}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value !== undefined ? value : undefined}
        maxLength={maxLength}
        onChange={handleInputChange}
        disabled={disabled}
        autoComplete="off"
        spellCheck="false"
      />

      {/* 右侧内容 */}
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