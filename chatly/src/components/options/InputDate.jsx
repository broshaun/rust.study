import React from 'react';
import styles from './InputDate.module.css';

/**
 * 原生 Flutter 风格日期选择器
 */
export const InputDate = ({
    label = '时间:',
    defaultValue = '',
    dateChange,
    width = '100%',
    borderColor = '#f0f0f0'
}) => {
    
    // 内部格式化函数：确保符合 input[type="date"] 要求的 YYYY-MM-DD
    const formatDate = (val) => {
        if (!val) return '';
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    };

    const handleChange = (e) => {
        const val = e.target.value;
        if (dateChange) dateChange(val);
    };

    return (
        <div className={styles.container} style={{ width, '--border-color': borderColor }}>
            {label && <label className={styles.label}>{label}</label>}
            <input
                type="date"
                className={styles.dateInput}
                defaultValue={formatDate(defaultValue)}
                onChange={handleChange}
            />
        </div>
    );
};