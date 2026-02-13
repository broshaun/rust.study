import React from 'react';
import styles from './FriendList.module.css';

// 好友列表数据（保留你的原始数据）
const friendsData = [
    {
        "friend_id": "698d51f3d63d2413753b8bde",
        "creator": "698d51f3d63d2413753b8bdd",
        "id": "698ea58dfb113c1a67910c59",
        'name': "张三"
    },
    {
        "friend_id": "698d87d07979d1a07eda1ed1",
        "creator": "698d51f3d63d2413753b8bdd",
        "id": "698ea5f4fb113c1a67910c60",
        'name': "李四"
    }
];

const FriendList = ({ onSelectFriend }) => {
    return (
        <div className={styles.friendListContainer}>
            {/* QQ风格标题 */}
            <div className={styles.friendListHeader}>我的好友 ({friendsData.length})</div>
            
            {/* 好友列表 */}
            <ul className={styles.friendList}>
                {friendsData.map(friend => (
                    <li 
                        key={friend.id} 
                        className={styles.friendItem}
                        onClick={() => onSelectFriend && onSelectFriend(friend)} // 点击好友回调
                    >
                        {/* QQ风格头像 */}
                        <div className={styles.friendAvatar}>
                            {friend.name.charAt(0)}
                        </div>
                        
                        {/* 好友信息 */}
                        <div className={styles.friendInfo}>
                            <h3 className={styles.friendName}>{friend.name}</h3>
                            <p className={styles.friendSubInfo}>ID: {friend.friend_id.slice(-6)}</p> {/* 简化显示ID */}
                        </div>
                        
                        {/* QQ风格在线状态 */}
                        <div className={styles.onlineStatus}>●</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export { FriendList };