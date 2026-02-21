import React from 'react';
import styles from './DialogList.module.css';

const DEFAULT_AVATAR = '/favicon.png';

// 时间格式化函数（保持原有规则）
const formatDialogTime = (timestamp) => {
  if (!timestamp) return '';
  const t = new Date(Number(timestamp));
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const diffDays = (today - targetDay) / (1000 * 60 * 60 * 24);
  const isThisYear = t.getFullYear() === now.getFullYear();

  if (diffDays === 0) {
    return t.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  if (diffDays === 1) {
    return '昨天';
  }

  if (diffDays > 1 && diffDays <= 6) {
    const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return week[t.getDay()];
  }

  if (isThisYear) {
    return `${t.getMonth() + 1}月${t.getDate()}日`;
  }

  return `${t.getFullYear()}年${t.getMonth() + 1}月`;
};

const DialogList = ({
  dialogData = [],
  onSelectDialog,
  onClear,
  buildAvatarUrl
}) => {
  const dialogList = React.useMemo(() => {
    return (Array.isArray(dialogData) ? dialogData : [])
      .filter(item => item && item.uid)
      .sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
  }, [dialogData]);

  const handleDelete = (item, e) => {
    e.stopPropagation();
    onClear?.(item);
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return DEFAULT_AVATAR;
    if (typeof buildAvatarUrl === 'function') {
      try { return buildAvatarUrl(avatarPath) || DEFAULT_AVATAR } catch (e) {}
    }
    return avatarPath;
  };

  const getDisplayName = (item) => {
    const remark = item.remark?.trim() || '';
    const nikename = item.nikename?.trim() || '';
    const email = item.email?.trim() || '';
    return remark || nikename || email || '未知联系人';
  };

  return (
    <div className={styles.dialogListContainer}>
      <div className={styles.dialogListHeader}>对话列表 ({dialogList.length})</div>
      <ul className={styles.dialogList}>
        {dialogList.length === 0 ? (
          <li className={styles.emptyDialogItem}>
            <div>💬</div><div>暂无对话</div>
          </li>
        ) : (
          dialogList.map(item => {
            const displayName = getDisplayName(item);
            const avatarUrl = getAvatarUrl(item.avatar_url);
            const dialogTime = formatDialogTime(item.timestamp);

            return (
              <li
                key={item.uid}
                className={styles.dialogItem}
                onClick={() => onSelectDialog?.(item)}
              >
                {/* 头像区域 */}
                <div className={styles.dialogAvatar}>
                  <img
                    src={avatarUrl}
                    alt=""
                    className={styles.avatarImg}
                    onError={(e) => e.currentTarget.src = DEFAULT_AVATAR}
                  />
                </div>

                {/* 核心信息区域 */}
                <div className={styles.dialogInfo}>
                  <h3 className={styles.dialogSender}>{displayName}</h3>
                </div>

                {/* 右上角：时间 + 指示灯（删除按钮左侧） */}
                <div className={styles.rightInfoWrapper}>
                  <span className={styles.dialogTimeText}>{dialogTime}</span>
                  {item.signal && (
                    <span className={`${styles.signalIndicator} ${styles[`signal_${item.signal}`]}`} />
                  )}
                </div>

                {/* 删除按钮（最右侧） */}
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(item, e)}
                  title="删除对话"
                >
                  ✕
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export { DialogList };