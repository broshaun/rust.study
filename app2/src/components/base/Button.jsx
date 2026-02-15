import React from 'react';
import './Button.css';


export const Button = ({
  onClick,
  children = 'Button',
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