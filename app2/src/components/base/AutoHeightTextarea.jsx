import React, { useState, useEffect, useRef, memo } from 'react';
import './AutoHeightTextarea.css';

/**
 * 自适应高度文本输入框组件
 * @param {Object} props
 * @param {string} props.defaultValue - 默认值
 * @param {Function} props.onChange - 内容变化回调 (value: string) => void
 * @param {string} props.placeholder - 占位符，默认"请输入内容..."
 * @param {string} props.label - 输入框标签
 * @param {number} props.minRows - 最小行数，默认1
 * @param {number} props.maxRows - 最大行数（超过滚动），默认8
 * @param {boolean} props.disabled - 是否禁用
 * @param {string} props.className - 自定义类名
 */
export const AutoHeightTextarea = memo(({
  defaultValue = '',
  onChange,
  placeholder = '请输入内容...',
  label = '',
  minRows = 5,
  maxRows = 6,
  disabled = false,
  className = '',
}) => {
  // 受控状态管理
  const [value, setValue] = useState(defaultValue);
  const textareaRef = useRef(null);
  const mirrorRef = useRef(null); // 镜像div，用于计算高度

  // 同步默认值变化
  useEffect(() => {
    setValue(defaultValue);
    // 初始化高度
    adjustHeight();
  }, [defaultValue]);

  // 自适应高度核心逻辑
  const adjustHeight = () => {
    if (!textareaRef.current || !mirrorRef.current) return;

    // 同步镜像div的内容和样式，保证高度计算准确
    mirrorRef.current.textContent = value || placeholder;
    const computedStyle = window.getComputedStyle(textareaRef.current);
    mirrorRef.current.style.cssText = `
      font-size: ${computedStyle.fontSize};
      font-family: ${computedStyle.fontFamily};
      line-height: ${computedStyle.lineHeight};
      padding: ${computedStyle.padding};
      border: ${computedStyle.borderWidth} solid transparent;
      width: ${computedStyle.width};
      white-space: pre-wrap;
      word-wrap: break-word;
      visibility: hidden;
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
    `;

    // 计算最小/最大高度
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const minHeight = lineHeight * minRows + 
                      parseFloat(computedStyle.paddingTop) + 
                      parseFloat(computedStyle.paddingBottom);
    const maxHeight = lineHeight * maxRows + 
                      parseFloat(computedStyle.paddingTop) + 
                      parseFloat(computedStyle.paddingBottom);
    
    // 获取镜像div的实际高度
    const mirrorHeight = mirrorRef.current.offsetHeight;
    // 最终高度：不小于最小高度，不大于最大高度
    const finalHeight = Math.min(Math.max(mirrorHeight, minHeight), maxHeight);

    // 设置textarea高度
    textareaRef.current.style.height = `${finalHeight}px`;
    // 超过最大高度显示滚动条
    textareaRef.current.style.overflowY = mirrorHeight > maxHeight ? 'auto' : 'hidden';
  };

  // 内容变化处理
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    adjustHeight(); // 实时调整高度
    onChange && onChange(newValue); // 触发外部回调
  };

  // 窗口大小变化时重新计算高度
  useEffect(() => {
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [value]);

  // 合并类名
  const containerClass = `auto-height-textarea-container ${className}`.trim();

  return (
    <div className={containerClass}>
      {/* 输入框标签 */}
      {label && <label className="textarea-label">{label}</label>}
      
      {/* 核心：textarea输入框 */}
      <textarea
        ref={textareaRef}
        className="auto-height-textarea"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        spellCheck="false"
        // 基础样式：消除默认样式差异
        style={{
          minHeight: 'inherit',
          resize: 'none', // 禁用手动调整大小
        }}
      />

      {/* 镜像div：用于计算高度（不可见） */}
      <div ref={mirrorRef} className="textarea-mirror" />
    </div>
  );
});

// 示例使用
export const AutoHeightTextareaDemo = () => {
  const [content, setContent] = useState('这是默认文本\n自动换行展示\n输入更多内容时，输入框会自动增高');

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h3 style={{ marginBottom: '16px' }}>自适应高度文本输入框示例</h3>
      <AutoHeightTextarea
        label="备注信息："
        defaultValue={content}
        onChange={setContent}
        placeholder="请输入备注信息，支持自动换行..."
        minRows={2}
        maxRows={6}
      />
      <div style={{ marginTop: '16px', color: '#666' }}>
        当前内容长度：<span style={{ color: '#1677ff' }}>{content.length}</span> 字符
      </div>
    </div>
  );
};
