import React, { useEffect } from 'react';
import styles from './Modal.module.css';

// 移除 onClose props，仅保留 visible 和 children
export default function Modal({ visible, children }) {
  // 优化body滚动锁定（仅保留核心逻辑，移除ESC关闭）
  useEffect(() => {
    if (visible) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]); // 移除 onClose 依赖

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}> {/* 移除点击遮罩关闭 */}
      <div
        className={styles.box}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 移除右上角关闭按钮 */}
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </div>
    </div>
  );
}

// 标题子组件（保持不变）
Modal.Title = ({ children }) => (
  <div className={styles.title}>{children}</div>
);

// 消息子组件（保持不变）
Modal.Message = ({ children }) => (
  <div className={styles.message}>{children}</div>
);

// 确定按钮子组件（保持不变）
Modal.Confirm = ({ children, onClick, className, ...rest }) => (
  <button 
    className={`${styles.confirmBtn} ${className || ''}`}
    onClick={onClick}
    {...rest}
    aria-label="确定"
  >
    {children || '确定'}
  </button>
);