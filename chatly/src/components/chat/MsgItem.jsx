import React, { memo } from "react";
import styles from './MsgItem.module.css';

// 圆角边框头像组件（非圆形，仅圆角）
const Avatar = ({ src, size = 36, roundedRadius = 6, fit = 'cover' }) => {
  return (
    <div 
      style={{
        width: size,
        height: size,
        borderRadius: `${roundedRadius}px`, // 圆角边框（非圆形）
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(var(--text-primary-rgb), 0.1)', // 兜底背景色
        border: '1px solid rgba(var(--text-primary-rgb), 0.08)', // 可选：加轻微边框更明显
      }}
    >
      <img 
        src={src || '默认头像地址'} 
        alt="avatar"
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit,
        }}
        onError={(e) => {
          e.target.src = '默认头像地址'; 
        }}
      />
    </div>
  );
};

// 补充 CSS 变量默认值（解决文字看不见问题）
if (!getComputedStyle(document.documentElement).getPropertyValue('--accent-color')) {
  document.documentElement.style.setProperty('--accent-color', '#0084ff');
}
if (!getComputedStyle(document.documentElement).getPropertyValue('--text-primary-rgb')) {
  document.documentElement.style.setProperty('--text-primary-rgb', '51, 51, 51');
}
if (!getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')) {
  document.documentElement.style.setProperty('--text-secondary', '#999999');
}

export const MsgItem = memo(
  ({ data, receiveAvatar, sendAvatar, virtualRow }) => {
    if (!data) return null;

    const isSend = data.signal === "send";
    const currentAvatarUrl = isSend ? sendAvatar : receiveAvatar;

    // 虚拟列表样式
    const virtualStyle = virtualRow
      ? {
          position: 'absolute',
          top: `${virtualRow.start}px`,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          boxSizing: 'border-box',
        }
      : {};

    return (
      <div 
        className={`${styles.msgWrapper} ${isSend ? styles.wrapperSend : styles.wrapperReceive}`}
        style={virtualStyle}
      >
        <div className={`${styles.chatRow} ${isSend ? styles.sendRow : styles.receiveRow}`}>
          <div className={styles.avatar}>
            {/* 头像圆角设为 6px（可根据需求调整），非圆形 */}
            <Avatar
              src={currentAvatarUrl}
              size={36}
              roundedRadius={6} // 圆角边框大小，对应你最初要求的 6px
            />
          </div>

          <div className={styles.bubbleWrap}>
            <div className={`${styles.bubble} ${isSend ? styles.sendBubble : styles.receiveBubble}`}>
              {data.msg}
            </div>
            {data.timestamp && <div className={styles.time}>{data.timestamp}</div>}
          </div>
        </div>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.receiveAvatar === next.receiveAvatar &&
      prev.sendAvatar === next.sendAvatar &&
      prev.data?.id === next.data?.id &&
      prev.data?.msg === next.data?.msg &&
      prev.data?.timestamp === next.data?.timestamp &&
      prev.data?.signal === next.data?.signal &&
      prev.virtualRow?.index === next.virtualRow?.index
    );
  }
);