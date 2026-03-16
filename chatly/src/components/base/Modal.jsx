import React, { useEffect, Children, isValidElement } from 'react';
import styles from './Modal.module.css';

export default function Modal({ visible, children }) {
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
  }, [visible]);

  if (!visible) return null;

  // 自动拆分：内容 + 按钮
  const { contentItems, actionItems } = Children.toArray(children).reduce(
    (acc, child) => {
      if (isValidElement(child)) {
        if (child.type === Modal.Confirm || child.type === Modal.Cancel) {
          acc.actionItems.push(child);
        } else {
          acc.contentItems.push(child);
        }
      }
      return acc;
    },
    { contentItems: [], actionItems: [] }
  );

  return (
    <div className={styles.overlay}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <div className={styles.contentWrapper}>{contentItems}</div>

        {actionItems.length > 0 && (
          <div className={styles.actions}>{actionItems}</div>
        )}
      </div>
    </div>
  );
}

/* 子组件 */
Modal.Title = ({ children }) => <div className={styles.title}>{children}</div>;
Modal.Message = ({ children }) => <div className={styles.message}>{children}</div>;
Modal.Actions = () => null; // 留着兼容，不影响

Modal.Confirm = ({ children, onClick, className, ...rest }) => (
  <button
    className={`${styles.confirmBtn} ${className || ''}`}
    onClick={onClick}
    {...rest}
  >
    {children || '确定'}
  </button>
);

Modal.Cancel = ({ children, onClick, className, ...rest }) => (
  <button
    className={`${styles.cancelBtn} ${className || ''}`}
    onClick={onClick}
    {...rest}
  >
    {children || '取消'}
  </button>
);