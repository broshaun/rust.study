import React from 'react';
import styles from './FriendList.module.css';

const FriendList = ({ friendsData = [], onSelectFriend }) => {
    return (

        <div className={styles.friendListContainer}>
            <div className={styles.friendListHeader}>
                我的好友 ({friendsData.length})
            </div>

            {/* 滚动区域高度自适应父容器剩余空间 */}
            <ul className={styles.friendList}>
                {friendsData.length === 0 ? (
                    <li className={styles.emptyItem}>
                        <span className={styles.emptyIcon}>💬</span>
                        <span className={styles.emptyText}>暂无好友</span>
                    </li>
                ) : (
                    friendsData.map(friend => (
                        <li
                            key={friend.friend_id}
                            className={styles.friendItem}
                            onClick={() => onSelectFriend?.(friend)}
                        >
                            <div className={styles.friendAvatar}>
                                {(friend?.remark ?? "").charAt(0)}
                            </div>

                            <div className={styles.friendInfo}>
                                <h3 className={styles.friendName}>
                                    {friend?.remark ?? ""}
                                </h3>
                                <p className={styles.friendSubInfo}>
                                    ID: {friend.friend_id.slice(-6)}
                                </p>
                            </div>

                            <div className={styles.onlineStatus}>●</div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export { FriendList };