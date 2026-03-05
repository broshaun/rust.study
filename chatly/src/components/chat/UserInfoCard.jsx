import React, { useState } from 'react';
import styles from './UserInfoCard.module.css';

/**
 * 用户信息卡片
 * @param {Object} data - 用户原始数据对象
 */
export const UserInfoCard = ({
  title = '用户核心信息',
  data = {}, // 建议直接传对象，避免遍历 children
  onAction,  // 统一的操作回调 (type, id) => void
  actionText = '添加好友',
  refuseText = '拒绝',
  loading = false,
  background = '',
  clickable = true,
  children
}) => {
  const [handled, setHandled] = useState(false);

  // 统一处理点击事件
  const handleExecute = async (type) => {
    if (loading || handled) return;
    try {
      if (onAction) await onAction(type, data.id);
      setHandled(true);
    } catch (err) {
      console.error(`${type}操作失败:`, err);
    }
  };

  // 背景样式处理
  const getCardStyle = () => {
    if (!background) return {};
    return background.includes('http') || background.includes('url(')
      ? { backgroundImage: `url(${background})`, color: '#fff' }
      : { backgroundColor: background };
  };

  return (
    <div 
      className={`${styles.card} ${clickable ? styles.clickable : ''}`}
      style={getCardStyle()}
    >
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <div className={styles.btnGroup}>
          <button
            className={`${styles.btn} ${styles.primary} ${handled ? styles.disabled : ''}`}
            onClick={(e) => { e.stopPropagation(); handleExecute('accept'); }}
            disabled={loading || handled}
          >
            {handled ? '已处理' : loading ? '...' : actionText}
          </button>
          
          <button
            className={`${styles.btn} ${styles.danger} ${handled ? styles.disabled : ''}`}
            onClick={(e) => { e.stopPropagation(); handleExecute('refuse'); }}
            disabled={loading || handled}
          >
            {handled ? '已处理' : refuseText}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* 如果没有传 children，则默认渲染 data 中的信息 */}
        {children || (
          <>
            <div className={styles.avatarWrapper}>
              <img src={data.avatar || '/favicon.png'} alt="avatar" />
            </div>
            <div className={styles.infoBody}>
              <div className={styles.infoRow}>
                <span className={styles.label}>昵称：</span>
                <span className={styles.value}>{data.nickname || '未设置'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>邮箱：</span>
                <span className={styles.value}>{data.email || '未绑定'}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};