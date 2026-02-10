import React from 'react';
import './Menu.css';

export const Menu = ({ children }) => {
  return <nav className="custom-menu">{children}</nav>;
};

// 保留position属性，默认left，支持right
Menu.Item = ({ onClick, children, className = '', position = 'left' }) => {
  const finalClass = `custom-menu-item custom-menu-item--${position} ${className}`;
  return (
    <button 
      className={finalClass}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};