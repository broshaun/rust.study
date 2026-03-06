import React from 'react';
import styles from './Drawer.module.css';

/**
 * 极简 Drawer - 万能风格适配版
 * 职责：提供侧滑骨架，背景与边框随全局 theme.css 变量自动切换。
 */
export const Drawer = ({ isOpen, onClose, children, width = 280, style }) => {
  return (
    <div className={`${styles.drawerContainer} ${isOpen ? styles.open : ''}`}>
      <div className={styles.mask} onClick={onClose} />
      <aside 
        className={styles.content} 
        style={{ 
          width: typeof width === 'number' ? `${width}px` : width, 
          // 强化：使用 primary 颜色确保清晰，并提升抗锯齿能力
          color: 'var(--text-primary)',
          WebkitFontSmoothing: 'antialiased',
          ...style 
        }}
      >
        {/* 包裹一层，确保内容完全不被滤镜干扰 */}
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </aside>
    </div>
  );
};