import React, { memo } from "react";
import styles from './MsgItem.module.css';
import { SafeAvatar } from "components/flutter"; // 确保路径正确

/**
 * MsgItem - 聊天消息单项组件
 * 已接入 SafeAvatar 高性能缓存方案
 */
export const MsgItem = memo(
  ({ data, receiveAvatar, sendAvatar, virtualRow }) => {
    if (!data) return null;

    const isSend = data.signal === "send";
    // 根据发送/接收信号选择对应的头像地址
    const currentAvatarUrl = isSend ? sendAvatar : receiveAvatar;

    // 虚拟列表绝对定位样式
    const virtualStyle = virtualRow
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`, // 推荐使用 transform 性能更好
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
          {/* 头像区域 */}
          <div className={styles.avatar}>
            <SafeAvatar
              url={currentAvatarUrl}
              size={36}          // 聊天气泡旁的标准尺寸
              radius={6}         // 对应你要求的 6px 圆角（非圆形）
              cover={true}       // 强制比例裁剪，防止用户上传的长方形头像变形
              shadow="none"      // 聊天界面通常不需要阴影，保持简洁
              border="1px solid rgba(var(--text-primary-rgb, 51, 51, 51), 0.08)"
            />
          </div>

          {/* 消息气泡区域 */}
          <div className={styles.bubbleWrap}>
            <div className={`${styles.bubble} ${isSend ? styles.sendBubble : styles.receiveBubble}`}>
              {data.msg}
            </div>
            {/* 时间显示 */}
            {data.timestamp && <div className={styles.time}>{data.timestamp}</div>}
          </div>
        </div>
      </div>
    );
  },
  // 优化 memo 对比逻辑
  (prev, next) => {
    return (
      prev.receiveAvatar === next.receiveAvatar &&
      prev.sendAvatar === next.sendAvatar &&
      prev.data?.id === next.data?.id &&
      prev.data?.msg === next.data?.msg &&
      prev.data?.timestamp === next.data?.timestamp &&
      prev.data?.signal === next.data?.signal &&
      prev.virtualRow?.start === next.virtualRow?.start &&
      prev.virtualRow?.size === next.virtualRow?.size
    );
  }
);

MsgItem.displayName = 'MsgItem';