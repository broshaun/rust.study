import React, { useEffect, useMemo, useRef } from 'react';
import styles from './SimpleSelect.module.css';

const DEFAULT_OPTIONS = [
  { value: '', label: '请选择' },
];

export const SimpleSelect = ({
  label,
  icon,
  options,
  defaultValue,
  onChange,
}) => {
  const containerRef = useRef(null);
  const labelRef = useRef(null);

  const opts = options?.length ? options : DEFAULT_OPTIONS;
  const dv = defaultValue ?? opts[0]?.value ?? '';

  const containerClass = useMemo(() => {
    const cls = [styles.container];
    if (label) cls.push(styles.labeled);
    if (icon) cls.push(styles.iconLeft);
    return cls.join(' ');
  }, [label, icon]);

  useEffect(() => {
    if (!label || !containerRef.current || !labelRef.current) return;
    containerRef.current.style.setProperty('--label-width', `${labelRef.current.offsetWidth}px`);
  }, [label]);

  const handleChange = (e) => {
    const v = e.target.value;
    const opt = opts.find(o => o.value === v);
    onChange?.(v, opt?.label);
  };

  return (
    <div className={containerClass} ref={containerRef}>
      {label && (
        <label className={styles.label} ref={labelRef}>
          {label}
        </label>
      )}

      {icon && <i className={styles.icon}>{icon}</i>}

      <select className={styles.select} defaultValue={dv} onChange={handleChange}>
        {opts.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
};