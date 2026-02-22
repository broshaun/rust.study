import React, { useMemo } from "react";
import styles from "./FriendList.module.css";

const DEFAULT_AVATAR = "/favicon.png";

const getName = (friend) => {
  if (!friend) return "未知好友";
  return friend.remark || friend.nikename || friend.email || friend.friend_id || "未知好友";
};

const getFriendEmail = (friend) => {
  if (!friend) return "未绑定邮箱";
  const email = friend.email;
  return email && typeof email === "string" ? email : "未绑定邮箱";
};

/**
 * 头像渲染：
 * - renderAvatar(friend) 优先
 * - 否则默认用 friend.avatar_url
 * - 图片失败 fallback 到 DEFAULT_AVATAR
 */
const renderFriendAvatar = (friend, renderAvatar) => {
  if (!friend) {
    return <img className={styles.avatarImg} src={DEFAULT_AVATAR} alt="默认头像" />;
  }

  if (typeof renderAvatar === "function") {
    // 注意：外部 renderAvatar 建议返回 <img className={styles.avatarImg} .../>
    // 即便外部返回别的元素，friendAvatar 容器也会做居中展示
    return renderAvatar(friend);
  }

  const avatarUrl = friend.avatar_url || DEFAULT_AVATAR;

  return (
    <img
      className={styles.avatarImg}
      src={avatarUrl}
      alt={getName(friend)}
      onError={(e) => {
        e.currentTarget.src = DEFAULT_AVATAR;
      }}
    />
  );
};

const FriendList = ({
  data,
  onSelectFriend,
  renderAvatar,
  onlineStatusKey = "is_online",
}) => {
  const list = useMemo(() => {
    if (!data || typeof data !== "object") return [];
    const detail = data.detail;
    return Array.isArray(detail) ? detail.filter(Boolean) : [];
  }, [data]);

  const total = useMemo(() => {
    const dataTotal = data?.total;
    return typeof dataTotal === "number" && dataTotal >= 0 ? dataTotal : list.length;
  }, [data, list]);

  const handleSelectFriend = (friend) => {
    if (typeof onSelectFriend === "function") onSelectFriend(friend);
  };

  return (
    <div className={styles.friendListContainer}>
      <div className={styles.friendListHeader}>我的好友 ({total})</div>

      <ul className={styles.friendList}>
        {list.length === 0 ? (
          <li className={styles.emptyItem}>
            <span className={styles.emptyIcon}>💬</span>
            <span className={styles.emptyText}>暂无好友</span>
          </li>
        ) : (
          list.map((friend, index) => {
            if (!friend) return null;

            const name = getName(friend);
            const email = getFriendEmail(friend);
            const itemKey = friend.id || friend.friend_id || `friend_${index}`;

            return (
              <li
                key={itemKey}
                className={`${styles.friendItem} ${
                  friend[onlineStatusKey] ? styles.online : styles.offline
                }`}
                onClick={() => handleSelectFriend(friend)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.friendAvatar}>
                  {renderFriendAvatar(friend, renderAvatar)}
                </div>

                <div className={styles.friendInfo}>
                  <h3 className={styles.friendName}>{name}</h3>
                  <p className={styles.friendSubInfo}>邮箱: {email}</p>
                </div>

                {friend[onlineStatusKey] && (
                  <div className={styles.onlineStatus} title="在线">
                    ●
                  </div>
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