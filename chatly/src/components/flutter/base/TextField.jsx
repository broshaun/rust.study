import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import styles from './TextField.module.css';

// Flutter 输入框类型枚举
export const TextFieldType = {
  text: 'text',
  password: 'password',
  email: 'email',
  number: 'number',
};

// Flutter 输入框装饰位置
export const InputDecorationPosition = {
  none: 'none',
  filled: 'filled', // 带背景填充
  outlined: 'outlined', // 边框样式
};

const TextField = forwardRef(({
  // Flutter 核心属性
  controller, // 控制器（模拟 Flutter TextEditingController）
  placeholder, // 提示文本
  label, // 标签文本
  hintText, // 提示文本（兼容 Flutter 命名）
  type = TextFieldType.text,
  decoration = InputDecorationPosition.outlined,
  obscureText = false, // 是否隐藏文本（密码）
  enabled = true, // 是否可用
  readOnly = false,
  errorText, // 错误提示文本
  prefixIcon, // 前缀图标
  suffixIcon, // 后缀图标
  borderRadius = 8,
  contentPadding = '0 12px',
  // 交互属性
  onChange, // 内容变化事件
  onSubmitted, // 提交事件（回车）
  // 扩展属性
  style,
  className,
  maxLength,
}, ref) => {
  // 内部状态（兼容 controller 外部控制）
  const [value, setValue] = useState(controller?.value || '');
  const [showPassword, setShowPassword] = useState(!obscureText);
  const [isFocused, setIsFocused] = useState(false);

  // 暴露方法给外部（模拟 Flutter controller）
  useImperativeHandle(ref, () => ({
    clear: () => setValue(''),
    getValue: () => value,
    setValue: (val) => setValue(val),
  }));

  // 同步外部 controller 变化（简化版）
  useEffect(() => {
    if (controller?.value !== value) {
      setValue(controller?.value || '');
    }
  }, [controller?.value]);

  // 输入处理
  const handleChange = (e) => {
    if (!enabled || readOnly) return;
    const val = e.target.value;
    setValue(val);
    onChange?.(val);
    controller?.onChange?.(val); // 同步到外部 controller
  };

  // 回车提交
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSubmitted?.(value);
    }
  };

  // 输入框实际类型
  const inputType = obscureText ? (showPassword ? 'text' : 'password') : type;
  // 最终提示文本（兼容 Flutter 命名）
  const finalPlaceholder = placeholder || hintText;

  // 原生拼接类名（替代 clsx）
  const getCombinedClassName = () => {
    const classList = [
      styles.textField,
      styles[`decoration-${decoration}`],
      // 条件类名
      !enabled ? styles.disabled : '',
      isFocused ? styles.focused : '',
      errorText ? styles.hasError : '',
      // 外部自定义类名
      className || ''
    ];
    // 过滤空值，拼接成字符串
    return classList.filter(Boolean).join(' ');
  };

  return (
    <div 
      className={getCombinedClassName()}
      style={{
        borderRadius,
        ...style,
      }}
    >
      {/* 标签文本（Flutter label 属性） */}
      {label && (
        <label className={styles.label}>{label}</label>
      )}

      {/* 输入框主体 */}
      <div className={styles.inputWrapper}>
        {/* 前缀图标 */}
        {prefixIcon && (
          <span className={styles.prefixIcon}>{prefixIcon}</span>
        )}

        {/* 输入框 */}
        <input
          type={inputType}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={finalPlaceholder}
          disabled={!enabled}
          readOnly={readOnly}
          maxLength={maxLength}
          className={styles.input}
          style={{
            padding: contentPadding,
          }}
        />

        {/* 后缀图标/密码显隐 */}
        <span className={styles.suffixWrapper}>
          {obscureText ? (
            <span 
              className={styles.suffixIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'} {/* 简易密码图标，可替换为 react-icons */}
            </span>
          ) : (
            suffixIcon && <span className={styles.suffixIcon}>{suffixIcon}</span>
          )}
        </span>
      </div>

      {/* 错误提示文本 */}
      {errorText && (
        <div className={styles.errorText}>{errorText}</div>
      )}
    </div>
  );
});

export default TextField;