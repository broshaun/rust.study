import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconItem } from 'components/icon/IconItem';
import './SimpleSelect.css';

const DEFAULT_OPTIONS = [
  { value: '', label: '请选择', disabled: false },
  { value: 'admin', label: '管理员' },
  { value: 'views', label: '查看者' },
];

export const SimpleSelect = ({
  label,
  icon,
  options = DEFAULT_OPTIONS,
  defaultValue = '',
  onChange,
}) => {
  const containerRef = useRef(null);
  const labelRef = useRef(null);

  // ⚠️ 统一把值转成 string，避免 1 vs "1" 这种“永远选不中”的问题
  const norm = (v) => (v === null || v === undefined ? '' : String(v));

  // 缓存选项中的有效 value 集合，用于后续校验
  const valuesSet = useMemo(() => {
    const s = new Set();
    for (const o of options || []) s.add(norm(o?.value));
    return s;
  }, [options]);

  // 净化值：确保传入的值在有效选项集合中，否则返回空字符串
  const sanitize = (v) => (valuesSet.has(norm(v)) ? norm(v) : '');

  // ✅ 内部状态完全自主管理，仅基于 defaultValue 初始化（无外部 value 依赖）
  const [innerValue, setInnerValue] = useState(() => sanitize(defaultValue));

  // ✅ 非受控模式：仅监听 defaultValue 和 options 变化，同步更新内部状态（适配动态默认值）
  useEffect(() => {
    setInnerValue(sanitize(defaultValue));
  }, [defaultValue, valuesSet]); // valuesSet 变化（options 变）也要重新校验并同步

  // 计算 label 宽度，适配样式（仅首次挂载执行）
  useEffect(() => {
    if (labelRef.current && containerRef.current) {
      containerRef.current.style.setProperty('--label-width', `${labelRef.current.offsetWidth}px`);
    }
  }, []);

  // 处理下拉框选择变化，保证 UI 即时响应
  const handleChange = (e) => {
    const next = sanitize(e.target.value);

    // ✅ 先更新内部状态，让 UI 立刻变化（不依赖父组件，解决“不能变动”的问题）
    setInnerValue(next);

    // 查找对应的选项，触发父组件回调，传递净化后的值和对应的 label
    const opt = (options || []).find(o => norm(o?.value) === next) || options?.[0] || { label: '' };
    onChange?.(next, opt.label || '');
  };

  // 拼接容器类名，保留原有样式逻辑
  const containerClass = `simple-select-container ${label ? 'labeled' : ''} ${icon ? 'icon left' : ''}`.trim();

  return (
    <div className={containerClass} ref={containerRef}>
      {label && <label className="simple-select-label" ref={labelRef}>{label}</label>}
      {icon && (
        <i className="simple-select-icon">
          <IconItem name={icon} size={24} />
        </i>
      )}
      
      <select
        className="native-select"
        value={innerValue}
        onChange={handleChange}
        autoComplete="off"
      >
        {(options || []).map((opt, idx) => (
          <option
            key={`select-opt-${idx}-${norm(opt?.value)}`}
            value={norm(opt?.value)}
            disabled={!!opt?.disabled}
          >
            {opt?.label ?? '请选择'}
          </option>
        ))}
      </select>



    </div>
  );
};