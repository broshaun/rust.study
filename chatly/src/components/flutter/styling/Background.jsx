import React from 'react';
import styles from './Background.module.css';

const Background = ({ className = '', style }) => {
  return (
    <div
      className={[styles.background, className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    >
      <div className={styles.base} />
      <div className={styles.glow} />
      <div className={styles.overlay} />
    </div>
  );
};

export default Background;