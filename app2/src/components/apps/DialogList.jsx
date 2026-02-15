import React from 'react';
import styles from './DialogList.module.css'; // 对应CSS文件名

// 默认头像（当avatar为null时使用）
const DEFAULT_AVATAR = 'favicon.png';

// 对话列表组件（原MsgList，适配对象格式的好友数据）
const DialogList = ({ dialogsData = {}, onSelectDialog, onClear }) => { // Msg→Dialog 语义化
    // 将对象转为数组：提取key（id）和value（对话信息）
    const dialogList = React.useMemo(() => { // friendList → dialogList
        // 过滤空值，转为 [{ id: 'xxx', remark: 'xxx', ... }, ...] 格式
        return Object.entries(dialogsData).map(([id, info]) => ({
            id, // 取对象的key作为id
            ...info // 合并remark/avatar/friend_id等字段
        })).filter(item => item); // 过滤无效项
    }, [dialogsData]); // msgsData → dialogsData

    // 处理删除逻辑（阻止冒泡 + 调用外部回调）
    const handleDelete = (item, e) => {
        e.stopPropagation(); // 避免触发对话项点击事件
        if (typeof onClear === 'function') {
            onClear(item); // 对外传递要删除的对话数据
        }
    };

    return (
        <div className={styles.dialogListContainer}> {/* msg→dialog */}
            <div className={styles.dialogListHeader}>
                对话列表 ({dialogList.length}) {/* 消息列表 → 对话列表 */}
            </div>

            {/* 对话列表 */}
            <ul className={styles.dialogList}> {/* msgList → dialogList */}
                {dialogList.length === 0 ? (
                    <li className={styles.emptyDialogItem}> {/* emptyMsgItem → emptyDialogItem */}
                        <div className={styles.emptyIcon}>💬</div>
                        <div className={styles.emptyText}>暂无对话</div> {/* 暂无消息 → 暂无对话 */}
                    </li>
                ) : (
                    dialogList.map(item => {
                        const remark = item.remark || '未知联系人'; // 未知好友 → 未知联系人
                        const friendId = item.friend_id || '无ID';
                        const avatar = item.avatar || DEFAULT_AVATAR;
                        const avatarText = remark.charAt(0);

                        return (
                            <li
                                key={item.id || item.friend_id} // 用id或friend_id作为唯一key
                                className={styles.dialogItem} // msgItem → dialogItem
                                onClick={() => onSelectDialog?.(item)} // onSelectMsg → onSelectDialog
                            >
                                <button 
                                    className={styles.deleteBtn}
                                    onClick={(e) => handleDelete(item, e)}
                                    title="删除该对话" // 删除该好友 → 删除该对话
                                >
                                    ✕
                                </button>

                                {/* 联系人头像（QQ风格） */}
                                <div className={styles.dialogAvatar}> {/* msgAvatar → dialogAvatar */}
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

                                {/* 联系人信息区域 */}
                                <div className={styles.dialogInfo}> {/* msgInfo → dialogInfo */}
                                    {/* 联系人备注 */}
                                    <h3 className={styles.dialogSender}> {/* msgSender → dialogSender */}
                                        {remark}
                                    </h3>
                                    {/* 联系人ID信息 */}
                                    <p className={styles.dialogPreview}> {/* msgPreview → dialogPreview */}
                                        ID: {friendId.slice(-6)}
                                    </p>
                                </div>

                                {/* 移除在线状态区域 */}
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
};

export { DialogList }; // 导出名从 MsgList → DialogList