import React from 'react';
import styles from './MsgList.module.css';




// const msgsData = {
//     "698ec9d84b06297a39d431d1": {
//         "remark": "张三",
//         "avatar": null,
//         "friend_id": "698d51f3d63d2413753b8bdd",
//     },
//     "698ec9d84b06297a39d431d2": {
//         "remark": "李四",
//         "avatar": null,
//         "friend_id": "698d51f3d63d2413753b8bdd",
//     }
// }

// 默认头像（当avatar为null时使用）
const DEFAULT_AVATAR = 'favicon.png';

// 消息列表组件（适配对象格式的好友数据）
const MsgList = ({ msgsData = {}, onSelectMsg }) => {
    // 将对象转为数组：提取key（id）和value（好友信息）
    const friendList = React.useMemo(() => {
        // 过滤空值，转为 [{ id: 'xxx', remark: 'xxx', ... }, ...] 格式
        return Object.entries(msgsData).map(([id, info]) => ({
            id, // 取对象的key作为id
            ...info // 合并remark/avatar/friend_id等字段
        })).filter(item => item); // 过滤无效项
    }, [msgsData]);

    return (
        <div className={styles.msgListContainer}>
            {/* QQ风格消息列表标题 */}
            <div className={styles.msgListHeader}>
                我的好友 ({friendList.length})
            </div>

            {/* 消息列表 */}
            <ul className={styles.msgList}>
                {friendList.length === 0 ? (
                    <li className={styles.emptyMsgItem}>
                        <div className={styles.emptyIcon}>💬</div>
                        <div className={styles.emptyText}>暂无好友</div>
                    </li>
                ) : (
                    friendList.map(item => {
                        // 处理空值：remark为空时显示"未知好友"，friend_id为空时显示"无ID"
                        const remark = item.remark || '未知好友';
                        const friendId = item.friend_id || '无ID';
                        const avatar = item.avatar || DEFAULT_AVATAR;
                        // 头像显示：优先用备注首字符，有头像URL则显示图片
                        const avatarText = remark.charAt(0);

                        return (
                            <li
                                key={item.id || item.friend_id} // 用id或friend_id作为唯一key
                                className={styles.msgItem}
                                onClick={() => onSelectMsg?.(item)} // 回调返回完整好友数据
                            >
                                {/* 好友头像（QQ风格） */}
                                <div className={styles.msgAvatar}>
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt={remark}
                                            className={styles.avatarImg}
                                            onError={(e) => {
                                                // 头像加载失败时显示文字占位
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <span className={styles.avatarText}>{avatarText}</span>
                                </div>

                                {/* 好友信息区域 */}
                                <div className={styles.msgInfo}>
                                    {/* 好友备注 */}
                                    <h3 className={styles.msgSender}>
                                        {remark}
                                    </h3>
                                    {/* 好友ID信息 */}
                                    <p className={styles.msgPreview}>
                                        ID: {friendId.slice(-6)}
                                    </p>
                                </div>

                                {/* QQ风格在线状态 */}
                                <div className={styles.msgMeta}>
                                    <span className={styles.onlineStatus}>●</span>
                                </div>
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
};

export { MsgList };