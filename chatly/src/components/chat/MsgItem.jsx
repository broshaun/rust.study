import React from 'react';
import { Avatar } from 'components/flutter'; // 按照你的要求导入
import styles from './MsgItem.module.css';



export const MsgItem = React.memo(({ data, receiveAvatar, sendAvatar }) => {
  if (!data) return null;

  const isSend = data.signal === "send";
  // 根据发送/接收状态选择对应的头像 URL
  const currentAvatarUrl = isSend ? sendAvatar : receiveAvatar;

  return (
    <div className={`${styles.msgWrapper} ${isSend ? styles.wrapperSend : styles.wrapperReceive}`}>
      <div className={`${styles.chatRow} ${isSend ? styles.sendRow : styles.receiveRow}`}>
        {/* 头像展示 */}
        <div className={styles.avatar}>
          <Avatar
            src={currentAvatarUrl}
            size={36}
            roundedRadius={6}
            variant="rounded"
            fit="cover"
          />
        </div>

        {/* 消息主体 */}
        <div className={styles.bubbleWrap}>
          <div className={`${styles.bubble} ${isSend ? styles.sendBubble : styles.receiveBubble}`}>
            {data.msg}
          </div>
          {data.timestamp && <div className={styles.time}>{data.timestamp}</div>}
        </div>
      </div>
    </div>
  );
})