import React, { useMemo } from 'react'
import styles from './FriendList.module.css'

// 默认头像（放在 public 目录或自行调整路径）
const DEFAULT_AVATAR = '/favicon.png'

// 优化：抽离工具函数，增加空值校验
const getName = (friend) => {
  // 先判断 friend 是否存在，避免空值访问
  if (!friend) return '未知好友';
  return friend.remark || friend.nikename || friend.email || friend.friend_id || '未知好友';
};

// 优化：抽离头像处理逻辑，增加容错
const getAvatarUrl = (friend, buildAvatarUrl) => {
  if (!friend) return DEFAULT_AVATAR;
  // 优先使用构建后的头像，无则用原始头像，最后兜底默认头像
  const rawAvatar = friend.avatar_url;
  if (!rawAvatar) return DEFAULT_AVATAR;
  return typeof buildAvatarUrl === 'function' ? buildAvatarUrl(rawAvatar) : rawAvatar;
};

// 优化：抽离ID处理逻辑，避免切片异常
const getShortFriendId = (friend) => {
  if (!friend) return '----';
  const friendId = String(friend.friend_id || '');
  return friendId.length >= 6 ? friendId.slice(-6) : friendId || '----';
};

const FriendList = ({ 
  data, 
  onSelectFriend, 
  buildAvatarUrl,
  // 新增：支持自定义在线状态字段（适配不同数据源）
  onlineStatusKey = 'is_online'
}) => {
  // BUG修复1：严格校验 data.detail 的类型，避免非数组导致的渲染异常
  const list = useMemo(() => {
    // 先判断 data 是否存在，再判断 detail 是否为数组
    if (!data || typeof data !== 'object') return [];
    const detail = data.detail;
    return Array.isArray(detail) ? detail.filter(Boolean) : []; // 过滤数组中的空值
  }, [data]);

  // BUG修复2：total 计算容错，避免 NaN
  const total = useMemo(() => {
    // 优先使用 data.total（后端返回的总数），无则用列表长度，兜底0
    const dataTotal = data?.total;
    return typeof dataTotal === 'number' && dataTotal >= 0 
      ? dataTotal 
      : list.length;
  }, [data, list]);

  // BUG修复3：处理 onSelectFriend 空值，避免调用 undefined 函数
  const handleSelectFriend = (friend) => {
    if (typeof onSelectFriend === 'function') {
      onSelectFriend(friend);
    }
  };

  return (
    <div className={styles.friendListContainer}>
      <div className={styles.friendListHeader}>
        我的好友 ({total})
      </div>

      <ul className={styles.friendList}>
        {list.length === 0 ? (
          <li className={styles.emptyItem}>
            <span className={styles.emptyIcon}>💬</span>
            <span className={styles.emptyText}>暂无好友</span>
          </li>
        ) : (
          list.map((friend, index) => {
            // 双重保险：过滤空的好友项
            if (!friend) return null;

            const name = getName(friend);
            const avatar = getAvatarUrl(friend, buildAvatarUrl);
            const shortId = getShortFriendId(friend);
            // BUG修复4：动态控制在线状态，默认隐藏离线状态
            const isOnline = Boolean(friend[onlineStatusKey]);
            
            // BUG修复5：生成唯一key，避免重复（优先用ID，无则用索引）
            const itemKey = friend.id || friend.friend_id || `friend_${index}`;

            return (
              <li
                key={itemKey}
                className={`${styles.friendItem} ${isOnline ? styles.online : styles.offline}`}
                onClick={() => handleSelectFriend(friend)}
                // 增加 cursor 样式，提升交互体验
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.friendAvatar}>
                  <img
                    className={styles.avatarImg}
                    src={avatar}
                    alt={name} // 优化：用好友名作为 alt，提升可访问性
                    // BUG修复6：图片加载失败时显示默认头像
                    onError={(e) => {
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                </div>

                <div className={styles.friendInfo}>
                  <h3 className={styles.friendName}>{name}</h3>
                  <p className={styles.friendSubInfo}>
                    ID: {shortId}
                  </p>
                </div>

                {/* BUG修复7：仅在线时显示状态圆点，离线隐藏 */}
                {isOnline && (
                  <div className={styles.onlineStatus} title="在线">●</div>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default FriendList;