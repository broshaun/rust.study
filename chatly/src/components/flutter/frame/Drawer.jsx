import React from 'react';
import styles from './Drawer.module.css';

export const Drawer = ({ isOpen, onClose, children, width = 250 }) => (
  <div className={`${styles.container} ${isOpen ? styles.open : ''}`}>
    <div className={styles.mask} onClick={onClose} />
    <aside className={styles.aside} style={{ '--w': `${width}px` }}>
      <div className={styles.scrollArea}>
        {children}
      </div>
    </aside>
  </div>
);