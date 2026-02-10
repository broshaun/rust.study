import React from 'react';
import './Button.css';

// 通用 Button 组件（可根据需要调整样式）
export const Button = ({
  onClick,
  children = '查询', // 默认文本为“查询”
  className = '',
  type = 'button',
  disabled = false
}) => {
  const buttonClass = `custom-button ${className}`;

  return (
    <button
      className={buttonClass}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};