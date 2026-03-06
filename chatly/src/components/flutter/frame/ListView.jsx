import React from 'react';
import styles from './ListView.module.css';

/**
 * ListView - 纯滚动容器
 * 职责：提供一个可滚动的 Flex 容器，锁定主轴方向。
 */
export const ListView = ({ 
  children, 
  padding = 0, 
  direction = 'column', // 支持 horizontal 扩展
  style 
}) => {
  const listStyle = {
    padding: typeof padding === 'number' ? `${padding}px` : padding,
    flexDirection: direction,
    ...style
  };

  return (
    <div className={styles.listView} style={listStyle}>
      {/* 这里的 children 可以是 ListTile, Card, 或者是手动写的 Divider */}
      {children}
    </div>
  );
};