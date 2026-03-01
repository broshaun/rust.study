import React from '.store/react@18.3.1/node_modules/react';
import styles from './ChatTransitionPage.module.css';

// 默认头像（avatar为null/加载失败时使用）
const DEFAULT_AVATAR = '/favicon.png'

/**
 * 聊天框过渡页面（好友信息+操作按钮）
 * @param {Object} props.friendData - 好友数据（适配新apiData结构）
 * @param {Function} props.onChat - 发起聊天回调
 * @param {Function} props.onVideo - 发起视频回调
 * @param {Function} props.onClose - 关闭过渡页回调（可选）
 * @param {Function} props.buildAvatarUrl - 自定义头像URL拼接函数（新增）
 * @param {Function} props.onDeleteFriend - 删除好友回调（新增）
 * @param {boolean} props.deleteFriendLoading - 删除好友按钮加载状态（新增，默认false）
 */
const ChatTransitionPage = ({
  friendData = {},
  onChat,
  onVideo,
  onClose,
  buildAvatarUrl,
  onDeleteFriend, // 新增：删除好友回调
  deleteFriendLoading = false // 新增：删除按钮加载状态
}) => {
  // 解构并处理空值，适配新apiData结构
  const {
    remark = null, 
    email = '无邮箱',
    nikename = '未知好友', // 优先用nikename作为显示名称
    avatar_url = null,    // 新的头像字段
    friend_id = '无ID',
    id = ''
  } = friendData;

  // 优先显示nikename，remark为null时兜底（兼容原有逻辑）
  const displayName = remark || nikename;

  // 修复friend_id切片异常：先转为字符串，空值兜底
  const shortFriendId = () => {
    const idStr = String(friend_id || id); // 兼容id/friend_id两种字段
    return idStr.length >= 6 ? idStr.slice(-6) : idStr;
  };

  // 拼接完整头像URL：优先使用自定义buildAvatarUrl，否则用默认兜底
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return DEFAULT_AVATAR;
    // 新增：如果传入了自定义拼接函数，优先使用
    if (typeof buildAvatarUrl === 'function') {
      return buildAvatarUrl(avatarPath) || DEFAULT_AVATAR;
    }
    // 兜底：默认拼接规则（可根据实际情况调整）
    return `https://your-domain.com/avatars/${avatarPath}`;
  };

  // 处理删除好友点击（阻止冒泡，避免触发其他事件）
  const handleDeleteFriend = (e) => {
    e.stopPropagation(); // 防止冒泡到卡片/其他按钮
    if (deleteFriendLoading) return; // 加载中不触发
    onDeleteFriend?.(friendData);
  };

  return (
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
            {avatar_url ? (
              <img
                src={getAvatarUrl(avatar_url)} // 使用自定义拼接的头像URL
                alt={displayName}
                className={styles.avatarImg}
                onError={(e) => {
                  // 头像加载失败时显示默认头像
                  e.target.src = DEFAULT_AVATAR;
                }}
              />
            ) : (
              // 无头像时直接显示默认头像
              <img
                src={DEFAULT_AVATAR}
                alt={displayName}
                className={styles.avatarImg}
              />
            )}
          </div>
        </div>

        {/* 好友备注区域：适配新字段 */}
        <div className={styles.friendInfo}>
          <h2 className={styles.friendName}>{displayName}</h2>
          <p className={styles.friendId}>ID: {shortFriendId()}</p>
          {/* 新增：显示邮箱字段 */}
          <p className={styles.friendEmail}>邮箱: {email}</p>
        </div>
      </div>

      {/* 操作按钮区域 - 固定在最底部，调整为三按钮布局 */}
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
        {/* 新增：删除好友按钮 */}
        <button
          className={`${styles.operBtn} ${styles.deleteBtn} ${deleteFriendLoading ? styles.loading : ''}`}
          onClick={handleDeleteFriend}
          disabled={deleteFriendLoading}
        >
          {deleteFriendLoading ? '删除中...' : '删除好友'}
        </button>
      </div>
    </div>
  );
};

export { ChatTransitionPage };


{/* <UserChat>
  <UserChat.Msg lable='发起聊天' onClick={(value)=>{console.log('点击选中了',value)}}/>
  <UserChat.Video lable='发起视频' onClick={(value)=>{console.log('点击选中了',value)}}/>
  <UserChat.Delete lable='删除好友' onClick={(value)=>{console.log('点击选中了',value)}}/>
</UserChat> */}