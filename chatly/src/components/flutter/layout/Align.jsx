import React from 'react';
import styles from './Align.module.css';

export const Left = ({ children, align = 'center' }) => (
  <div className={styles.left} data-v={align}>
    {children}
  </div>
);

export const Center = ({ children, align = 'center' }) => (
  <div className={styles.center} data-v={align}>
    {children}
  </div>
);

export const Right = ({ children, align = 'center' }) => (
  <div className={styles.right} data-v={align}>
    {children}
  </div>
);