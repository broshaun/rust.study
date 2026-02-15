import React from 'react';
import styles from './ChatTransitionPage.module.css';

// 默认头像（avatar为null时使用）
const DEFAULT_AVATAR = 'https://q1.qlogo.cn/g?b=qq&nk=0&s=640';

/**
 * 聊天框过渡页面（好友信息+操作按钮）
 * @param {Object} props.friendData - 好友数据
 * @param {Function} props.onChat - 发起聊天回调
 * @param {Function} props.onVideo - 发起视频回调
 * @param {Function} props.onClose - 关闭过渡页回调（可选）
 */
const ChatTransitionPage = ({ 
  friendData = {}, 
  onChat, 
  onVideo, 
  onClose 
}) => {
  // 解构并处理空值
  const {
    remark = '未知好友',
    avatar = null,
    friend_id = '无ID',
    id = ''
  } = friendData;
  
  // 头像文字占位（备注首字符）
  const avatarText = remark.charAt(0);

  return (
    // 移除全屏居中逻辑，直接渲染过渡容器
    <div className={styles.transitionContainer}>
      {/* 关闭按钮（可选） */}
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      )}

      {/* 内容区域（头像+备注）- 垂直居中 */}
      <div className={styles.contentWrapper}>
        {/* 好友头像区域 */}
        <div className={styles.avatarWrapper}>
          <div className={styles.friendAvatar}>
            {avatar ? (
              <img 
                src={avatar} 
                alt={remark} 
                className={styles.avatarImg}
                onError={(e) => {
                  // 头像加载失败显示文字占位
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span className={styles.avatarText}>{avatarText}</span>
          </div>
        </div>

        {/* 好友备注区域 */}
        <div className={styles.friendInfo}>
          <h2 className={styles.friendName}>{remark}</h2>
          <p className={styles.friendId}>ID: {friend_id.slice(-6)}</p>
        </div>
      </div>

      {/* 操作按钮区域 - 固定在最底部，左右分栏 */}
      <div className={styles.btnGroup}>
        <button 
          className={`${styles.operBtn} ${styles.chatBtn}`}
          onClick={() => onChat?.(friendData)}
        >
          发起聊天
        </button>
        <button 
          className={`${styles.operBtn} ${styles.videoBtn}`}
          onClick={() => onVideo?.(friendData)}
        >
          发起视频
        </button>
      </div>
    </div>
  );
};

export { ChatTransitionPage };