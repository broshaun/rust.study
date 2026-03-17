import React from "react";
import { Container, XBox, YBox, Avatar } from 'components/flutter';
import { useApiBase } from 'hooks/http';

/**
 * Friend - 紧凑型好友列表项
 */
export const Friend = React.memo(({
  data,
  onSelect,
  onAvatarClick,
  onlineStatusKey = "is_online",
  height = 50
}) => {
  const { apiBase } = useApiBase();

  if (!data) return null;

  const name = data.remark || data.nikename || data.email || "未知好友";
  const email = data.email || "未绑定邮箱";
  const isOnline = !!data[onlineStatusKey];

  const avatarSrc = data?.avatar_url
    ? `${String(apiBase || "").replace(/\/+$/, "")}/imgs/${String(data.avatar_url).replace(/^\/+/, "")}`
    : "";

  return (
    <div
      onClick={() => onSelect?.(data)}
      style={{
        cursor: 'pointer',
        height: typeof height === 'number' ? `${height}px` : height,
        width: '100%',
        boxSizing: 'border-box',
        background: 'transparent'
      }}
    >
      <Container
        height="100%"
        width="100%"
        padding="2px 10px"
        style={{ background: 'transparent' }}
      >
        <XBox
          height="100%"
          width="100%"
          align="middle"
          gap={8}
          style={{ background: 'transparent' }}
        >
          {/* 左侧头像 */}
          <XBox.Segment
            span={1}
            style={{
              flex: '0 0 auto',
              width: 38,
              padding: 0,
              background: 'transparent'
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
                justifyContent: 'center',
                background: 'transparent'
              }}
            >
              <Avatar
                src={avatarSrc}
                variant="square"
                size={38}
                fit="cover"
                roundedRadius={0}
              />

              {isOnline && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-color, #34c759)',
                    zIndex: 2
                  }}
                />
              )}
            </div>
          </XBox.Segment>

          {/* 信息区 */}
          <XBox.Segment
            span={1}
            align="left"
            style={{
              minWidth: 0,
              padding: 0,
              background: 'transparent'
            }}
          >
            <YBox
              height="100%"
              justify="middle"
              align="left"
              gap={1}
              style={{ minWidth: 0, background: 'transparent' }}
            >
              <span
                style={{
                  width: '100%',
                  fontSize: '14px',
                  fontWeight: '500',
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
                  color: 'var(--text-secondary)',
                  opacity: 0.72,
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
        </XBox>
      </Container>
    </div>
  );
});

export default Friend;