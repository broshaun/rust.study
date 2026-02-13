import React from 'react';
import styles from './FriendList.module.css';

const FriendList = ({ friendsData = [], onSelectFriend }) => {
    return (
        <div className={styles.friendListContainer}>

            <div className={styles.friendListHeader}>
                我的好友 ({friendsData.length})
            </div>

            <ul className={styles.friendList}>
                {friendsData.map(friend => (
                    <li
                        key={friend.friend_id} // ✅ 用 friend_id 更安全唯一
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
                ))}
            </ul>

        </div>
    );
};

export { FriendList };
