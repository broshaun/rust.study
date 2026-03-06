import React from 'react';
import styles from './Drawer.module.css';

/**
 * 全主题适配抽屉
 * 职责：透传主题变量，实现侧滑交互。
 */
export const Drawer = ({ isOpen, onClose, children, width = 250, style }) => (
  <div className={`${styles.container} ${isOpen ? styles.open : ''}`}>
    <div className={styles.mask} onClick={onClose} />
    <aside 
      className={styles.aside} 
      style={{ 
        '--w': typeof width === 'number' ? `${width}px` : width,
        ...style 
      }}
    >
      <div className={styles.scrollArea}>
        {children}
      </div>
    </aside>
  </div>
);