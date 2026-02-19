import React from 'react';
import styles from './DialogList.module.css';

// 默认头像
const DEFAULT_AVATAR = '/favicon.png';

const DialogList = ({ 
  dialogsData = {}, 
  onSelectDialog, 
  onClear,
  buildAvatarUrl 
}) => {
    // 【核心修改】按last_send_time降序排序（最新时间在前）
    const dialogList = React.useMemo(() => {
        return Object.entries(dialogsData)
            .map(([key, info]) => ({
                dataKey: key, // 保留原始对象key，用于状态更新
                ...info 
            }))
            .filter(item => item && item.id) // 过滤无效项
            .sort((a, b) => { 
                // last_send_time降序：b - a → 数值越大（时间越新）越靠前
                // 空值兜底：默认0，避免NaN
                const timeA = Number(a.last_send_time) || 0;
                const timeB = Number(b.last_send_time) || 0;
                return timeB - timeA;
            });
    }, [dialogsData]);

    // 处理删除逻辑
    const handleDelete = (item, e) => {
        e.stopPropagation();
        if (typeof onClear === 'function') {
            onClear(item);
        }
    };

    // 头像URL拼接
    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath || avatarPath.trim() === '') {
            return DEFAULT_AVATAR;
        }
        if (typeof buildAvatarUrl === 'function') {
            try {
                const customUrl = buildAvatarUrl(avatarPath);
                return customUrl || DEFAULT_AVATAR;
            } catch (err) {
                console.warn('头像URL拼接失败：', err);
                return DEFAULT_AVATAR;
            }
        }
        return avatarPath;
    };

    // 获取显示名称（兼容nikename为null的场景）
    const getDisplayName = (item) => {
        if (!item) return '未知联系人';
        // 优先级：remark → nikename → email → 兜底
        return item.remark || item.nikename || item.email || '未知联系人';
    };

    return (
        <div className={styles.dialogListContainer}>
            <div className={styles.dialogListHeader}>
                对话列表 ({dialogList.length})
            </div>

            <ul className={styles.dialogList}>
                {dialogList.length === 0 ? (
                    <li className={styles.emptyDialogItem}>
                        <div className={styles.emptyIcon}>💬</div>
                        <div className={styles.emptyText}>暂无对话</div>
                    </li>
                ) : (
                    dialogList.map((item, index) => {
                        const displayName = getDisplayName(item);
                        const email = item.email || '未绑定邮箱';
                        const avatarUrl = getAvatarUrl(item.avatar_url);
                        const avatarText = displayName.charAt(0);
                        // 唯一key：dataKey + 索引，避免重复
                        const uniqueKey = `${item.dataKey}_${index}`;

                        return (
                            <li
                                key={uniqueKey}
                                className={styles.dialogItem}
                                onClick={() => {
                                    onSelectDialog?.(item);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <button 
                                    className={styles.deleteBtn}
                                    onClick={(e) => handleDelete(item, e)}
                                    title="删除该对话"
                                >
                                    ✕
                                </button>

                                <div className={styles.dialogAvatar}>
                                    <img
                                        src={avatarUrl}
                                        alt={displayName}
                                        className={styles.avatarImg}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                    <span className={styles.avatarText}>{avatarText}</span>
                                </div>

                                <div className={styles.dialogInfo}>
                                    <h3 className={styles.dialogSender}>{displayName}</h3>
                                    <p className={styles.dialogPreview}>邮箱: {email}</p>
                                </div>
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
};

export { DialogList };