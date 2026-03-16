import React from 'react';
import styles from './WebShell.module.css';

/**
 * WebShell - 全平台 Web 环境抹平容器
 * 职责：确保 100dvh 高度，禁止根部溢出，提供全局皮肤底色。
 */
export const WebShell = ({ children, style, className = "" }) => {
  return (
    <div 
      className={`${styles.webShell} ${className}`} 
      style={style}
    >
      {children}
    </div>
  );
};