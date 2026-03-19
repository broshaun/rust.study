import React, { useState } from "react";
import styles from './UserInfoCard.module.css';

// --- 主组件 ---
export const UserInfoCard = ({
  title = '用户核心信息',
  onAction,
  actionText,
  refuseText,
  loading = false,
  background = '',
  children
}) => {
  const [handled, setHandled] = useState(false);

  const handleExecute = async (type) => {
    if (loading || handled) return;

    try {
      if (onAction) {
        await onAction(type);
      }
      setHandled(true);
    } catch (err) {
      console.error(`${type}操作失败:`, err);
    }
  };

  const getCardStyle = () => {
    if (!background) return {};

    return background.includes('http') || background.includes('url(')
      ? { backgroundImage: `url(${background})`, color: '#fff' }
      : { backgroundColor: background };
  };

  const showAccept = !!actionText;
  const showRefuse = !!refuseText;

  return (
    <div className={styles.card} style={getCardStyle()}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>

        {(showAccept || showRefuse) && (
          <div className={styles.btnGroup}>

            {showAccept && (
              <button
                className={`${styles.btn} ${styles.primary} ${handled ? styles.disabled : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleExecute('accept');
                }}
                disabled={loading || handled}
              >
                {handled ? '已处理' : loading ? '...' : actionText}
              </button>
            )}

            {showRefuse && (
              <button
                className={`${styles.btn} ${styles.danger} ${handled ? styles.disabled : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleExecute('refuse');
                }}
                disabled={loading || handled}
              >
                {handled ? '已处理' : refuseText}
              </button>
            )}

          </div>
        )}
      </div>

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};


// --- 子组件 ---

UserInfoCard.Avatar = ({ children }) => (
  <div className={styles.avatarWrapper}>
    {children}
  </div>
);

UserInfoCard.Info = ({ children }) => {
  const name = typeof children === 'object'
    ? (children?.remark || children?.nikename || children?.email || '未知')
    : children;

  return (
    <div className={styles.infoBody}>
      <div className={styles.infoRow}>
        <span className={styles.label}>名称：</span>
        <span className={styles.value}>{name}</span>
      </div>

      {children?.email && (
        <div className={styles.infoRow}>
          <span className={styles.label}>邮箱：</span>
          <span className={styles.value}>{children.email}</span>
        </div>
      )}
    </div>
  );
};