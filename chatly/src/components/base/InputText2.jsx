import React, { Children, isValidElement, useMemo, useRef, useLayoutEffect, useState, useEffect } from "react";
import { Icon } from 'components/flutter';
import styles from './InputText2.module.css';

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
  autoFit = false,
  minWidth = 200,
  maxWidth = 520,
  extraWidth = 28,
  width,
  // 掩码配置
  showMask = false,
  maskChar = '*',
  keepLastDigits = 4, // 保留最后4位真实展示
  maxMaskLength = 8, // *最多显示8位
}) => {
  const mirrorRef = useRef(null);
  const inputRef = useRef(null);
  // 内部维护：真实值（始终存储原始输入/粘贴内容）
  const [innerRealValue, setInnerRealValue] = useState(defaultValue);
  // 展示值（*最多8位 + 保留后4位）
  const [displayVal, setDisplayVal] = useState('');

  // ========== 核心：生成掩码展示值（*最多8位 + 保留后4位） ==========
  const generateMaskValue = (realVal) => {
    if (!showMask || !realVal) return realVal;
    const len = realVal.length;
    
    // 长度≤保留位数：直接显示真实值
    if (len <= keepLastDigits) return realVal;
    
    // 计算需要显示的*数量：最多8位
    const maskCount = Math.min(len - keepLastDigits, maxMaskLength);
    // 生成*部分（最多8个） + 后4位真实值
    const maskPart = maskChar.repeat(maskCount);
    const keepPart = realVal.slice(-keepLastDigits);
    
    return maskPart + keepPart;
  };

  // ========== 同步真实值 & 更新展示值 ==========
  // 1. 受控值 value 变化时同步
  useEffect(() => {
    if (value !== undefined) {
      setInnerRealValue(value);
      setDisplayVal(generateMaskValue(value));
    }
  }, [value, showMask, maskChar, keepLastDigits, maxMaskLength]);

  // 2. 非受控 defaultValue 初始化
  useEffect(() => {
    if (value === undefined && defaultValue) {
      setDisplayVal(generateMaskValue(defaultValue));
    }
  }, [defaultValue, showMask, maskChar, keepLastDigits, maxMaskLength]);

  // ========== 处理宽度 ==========
  const getWidthValue = (val) => {
    if (typeof val === 'number') return `${val}px`;
    if (typeof val === 'string' && (val.endsWith('px') || val.endsWith('%'))) return val;
    return `${val}px`;
  };

  const containerStyle = useMemo(() => {
    const style = {};
    if (width) style.width = getWidthValue(width);
    if (minWidth) style.minWidth = getWidthValue(minWidth);
    if (maxWidth) style.maxWidth = getWidthValue(maxWidth);
    return style;
  }, [width, minWidth, maxWidth]);

  // ========== 解析子组件 ==========
  const parseChildren = () => {
    const result = { left: { label: '', icon: '' }, right: { label: '', icon: '', onClick: null } };
    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      if (child.type === Left) result.left = { ...child.props };
      if (child.type === Right) result.right = { ...child.props };
    });
    return result;
  };

  const { left: leftProps, right: rightProps } = parseChildren();
  const isRightInteractive = typeof rightProps.onClick === 'function' && !disabled;

  // ========== 核心：输入/修改/粘贴 保持真实值 ==========
  const handleInputChange = (e) => {
    if (disabled || !onChangeValue) return;
    const realVal = e.target.value; // 原始输入值（完整保留）
    setInnerRealValue(realVal);
    // 生成掩码展示值（*最多8位 + 后4位）
    setDisplayVal(generateMaskValue(realVal));
    onChangeValue(realVal); // 对外传递完整真实值（关键！）
  };

  const handlePaste = (e) => {
    e.preventDefault(); // 阻止默认粘贴（避免显示原字符串）
    if (disabled || !onChangeValue) return;
    const pastedRealVal = e.clipboardData.getData('text'); // 粘贴的完整真实值
    setInnerRealValue(pastedRealVal);
    setDisplayVal(generateMaskValue(pastedRealVal));
    onChangeValue(pastedRealVal); // 对外传递完整真实值
  };

  // 处理输入框聚焦/编辑时的光标位置（优化体验）
  const handleFocus = () => {
    if (inputRef.current) {
      // 光标定位到最后一位（方便编辑）
      inputRef.current.selectionStart = inputRef.current.value.length;
      inputRef.current.selectionEnd = inputRef.current.value.length;
    }
  };

  const handleRightClick = (e) => {
    e.stopPropagation();
    if (!isRightInteractive) return;
    rightProps.onClick(e);
  };

  // ========== 自动适应宽度 ==========
  const mirrorFontSize = useMemo(() => {
    return typeof size === 'string' ? (size === 'small' ? 14 : size === 'large' ? 18 : 16) : 16;
  }, [size]);

  useLayoutEffect(() => {
    if (!autoFit || width) return;
    if (!mirrorRef.current || !inputRef.current) return;

    const mirrorText = displayVal || placeholder || '';
    mirrorRef.current.textContent = mirrorText;
    const measured = mirrorRef.current.offsetWidth + extraWidth;
    const minVal = typeof minWidth === 'number' ? minWidth : parseInt(minWidth) || 200;
    const maxVal = typeof maxWidth === 'number' ? maxWidth : parseInt(maxWidth) || 520;
    const nextWidth = Math.max(minVal, Math.min(maxVal, measured));

    inputRef.current.style.width = `${nextWidth}px`;
  }, [autoFit, displayVal, placeholder, minWidth, maxWidth, extraWidth, width]);

  // ========== 容器类名 ==========
  const containerClasses = useMemo(() => {
    return [
      styles.inputContainer,
      typeof size === 'string' && styles[`size-${size}`],
      styles[`position-${position}`],
      error && styles.error,
      disabled && styles.disabled,
      (leftProps.label || leftProps.icon) && styles.hasLeft,
      (rightProps.label || rightProps.icon) && styles.hasRight,
      isRightInteractive && styles.iconInteractive
    ].filter(Boolean).join(' ');
  }, [size, position, error, disabled, leftProps, rightProps, isRightInteractive]);

  return (
    <div className={containerClasses} style={containerStyle}>
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
              <Icon name={leftProps.icon} size={24} />
            </div>
          )}
        </div>
      )}

      {/* 输入框：展示掩码（*最多8位 + 后4位），可正常输入修改 */}
      <input
        ref={inputRef}
        className={`${styles.input} ${autoFit ? styles.autoFitInput : ''}`}
        type={type}
        placeholder={placeholder}
        value={displayVal} // 展示：最多8个* + 后4位真实值
        onChange={handleInputChange}
        onPaste={handlePaste}
        onFocus={handleFocus} // 优化光标位置
        maxLength={maxLength}
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
              <Icon name={rightProps.icon} size={24} />
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