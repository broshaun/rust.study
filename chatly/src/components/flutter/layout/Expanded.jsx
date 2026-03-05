// src/components/flutter/Expanded/Expanded.jsx
import React from 'react';
import styles from './Expanded.module.css';

const Expanded = ({
  flex = 1, // Flutter 的 flex 属性，默认1
  child,
  children,
}) => {
  const content = child || children;

  const expandedStyle = {
    flex: flex,
    minWidth: 0, // 解决 flex 子元素溢出问题
    minHeight: 0,
  };

  return (
    <div className={styles.expanded} style={expandedStyle}>
      {content}
    </div>
  );
};

export default Expanded;