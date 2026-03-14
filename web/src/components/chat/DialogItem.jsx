import React from 'react';
import { Container, XBox, YBox, Avatar } from 'components/flutter';
import { useImage } from 'hooks/http';

/**
 * 时间格式化工具
 */
const formatDialogTime = (timestamp) => {
  if (!timestamp) return "";
  const safeTimeStr = typeof timestamp === 'string' ? timestamp.replace(/-/g, '/') : timestamp;
  const t = new Date(safeTimeStr);
  if (isNaN(t.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const diffDays = (today - targetDay) / (1000 * 60 * 60 * 24);
  const isThisYear = t.getFullYear() === now.getFullYear();

  if (diffDays === 0) {
    return t.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  }
  if (diffDays === 1) return "昨天";
  if (diffDays > 1 && diffDays <= 6) {
    return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][t.getDay()];
  }
  if (isThisYear) return `${t.getMonth() + 1}月${t.getDate()}日`;
  return `${t.getFullYear()}年${t.getMonth() + 1}月`;
};

/**
 * DialogItem
 * signal === 'news' 时显示红点
 */
export const DialogItem = React.memo(({
  data,
  onSelect,
  onClear,
  onAvatarClick,
  height = 50
}) => {
  if (!data) return null;

  const name = data.remark || data.nikename || data.email || "未知联系人";
  const email = data.email || "未绑定邮箱";
  const timeStr = formatDialogTime(data.timestamp);
  const showDot = data.signal === 'news';

  const { avatarSrc } = useImage('/imgs', data?.avatar_url, { isAvatar: true });

  return (
    <div
      onClick={() => onSelect?.(data)}
      style={{
        cursor: 'pointer',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        boxSizing: 'border-box'
      }}
    >
      <Container height="100%" width="100%" padding="2px 10px">
        <XBox height="100%" width="100%" align="middle" gap={8}>
          
          {/* 左侧头像 */}
          <XBox.Segment
            span={1}
            style={{
              flex: '0 0 auto',
              width: 38,
              padding: 0
            }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                onAvatarClick?.(data);
              }}
              style={{
                position: 'relative',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Avatar
                src={avatarSrc}
                variant="rounded"
                size={38}
                fit="cover"
                roundedRadius={8}
              />

              {/* 新消息红点（无边框） */}
              {showDot && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#ff3b30',
                    transform: 'translate(25%, -25%)',
                    pointerEvents: 'none',
                    zIndex: 2
                  }}
                />
              )}
            </div>
          </XBox.Segment>

          {/* 中间信息区 */}
          <XBox.Segment
            span={1}
            align="left"
            style={{
              minWidth: 0,
              padding: 0
            }}
          >
            <YBox
              height="100%"
              justify="middle"
              gap={1}
              style={{ minWidth: 0 }}
            >
              <span
                style={{
                  width: '100%',
                  fontSize: '14px',
                  fontWeight: showDot ? '600' : '500',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '17px'
                }}
              >
                {name}
              </span>

              <span
                style={{
                  width: '100%',
                  fontSize: '11px',
                  color: showDot ? 'var(--text-primary)' : 'var(--text-secondary)',
                  opacity: showDot ? 0.9 : 0.72,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '13px'
                }}
              >
                {email}
              </span>
            </YBox>
          </XBox.Segment>

          {/* 右侧操作区 */}
          <XBox.Segment
            span={1}
            style={{
              flex: '0 0 auto',
              padding: 0,
              width: 48
            }}
            align="right"
          >
            <YBox
              height="100%"
              justify="middle"
              gap={2}
              style={{
                width: '100%',
                minWidth: 0
              }}
            >
              <span
                style={{
                  width: '100%',
                  textAlign: 'right',
                  fontSize: '10px',
                  color: 'var(--text-secondary)',
                  opacity: 0.45,
                  lineHeight: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                {timeStr}
              </span>

              <XBox
                width="100%"
                align="middle"
                justify="right"
                gap={6}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear?.(data);
                  }}
                  style={{
                    width: 14,
                    height: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    opacity: 0.35,
                    flex: '0 0 auto'
                  }}
                >
                  ✕
                </div>
              </XBox>
            </YBox>
          </XBox.Segment>

        </XBox>
      </Container>
    </div>
  );
});

export default DialogItem;