import React, { useEffect, useCallback } from 'react';
import styles from './Modal.module.css';

export default function Modal({ visible, onClose, children }) {
  // 优化body滚动锁定（避免多次执行）
  useEffect(() => {
    if (visible) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // 监听ESC键关闭（苹果原生支持）
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', handleEsc);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleEsc);
      };
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible, onClose]);

  // 优化关闭逻辑（防止多次触发）
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={styles.box}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className={styles.close} 
          onClick={handleClose}
          aria-label="关闭弹窗" // 无障碍优化
        >
          ×
        </button>
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </div>
    </div>
  );
}

// 标题子组件（保持简洁）
Modal.Title = ({ children }) => (
  <div className={styles.title}>{children}</div>
);

// 消息子组件（保持简洁）
Modal.Message = ({ children }) => (
  <div className={styles.message}>{children}</div>
);