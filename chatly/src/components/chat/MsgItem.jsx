import React from 'react';
import { useChatMsg } from './ChatMsg';
import styles from './MsgItem.module.css';

export const MsgItem = ({ data }) => {
  const { meta } = useChatMsg(); 
  if (!data) return null;

  const isSend = data.signal === "send";
  const avatarFn = isSend ? meta.sendAvatar : meta.receiveAvatar;

  return (
    <div className={`${styles.msgWrapper} ${isSend ? styles.wrapperSend : styles.wrapperReceive}`}>
      <div className={`${styles.chatRow} ${isSend ? styles.sendRow : styles.receiveRow}`}>
        <div className={styles.avatar}>
          {typeof avatarFn === 'function' ? avatarFn() : (isSend ? '我' : '客')}
        </div>
        <div className={styles.bubbleWrap}>
          <div className={`${styles.bubble} ${isSend ? styles.sendBubble : styles.receiveBubble}`}>
            {data.msg}
          </div>
          <div className={styles.time}>{data.timestamp}</div>
        </div>
      </div>
    </div>
  );
};