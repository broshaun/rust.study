import React from 'react';
import { Container, XBox, YBox, Avatar } from 'components/flutter';
import { useHttpClient2 } from 'hooks/http';

/**
 * Friend - 紧凑型好友列表项
 */
export const Friend = ({
  data,
  onSelect,
  onAvatarClick,
  onlineStatusKey = "is_online",
  height = 50
}) => {
  if (!data) return null;

  const name = data.remark || data.nikename || data.email || "未知好友";
  const email = data.email || "未绑定邮箱";
  const isOnline = !!data[onlineStatusKey];
  const { endpoint } = useHttpClient2('/imgs');

  return (
    <div
      onClick={() => onSelect?.(data)}
      style={{
        cursor: 'pointer',
        height: typeof height === 'number' ? `${height}px` : height,
        width: '100%',           // ⭐关键：撑满父容器
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
                imageBaseUrl={endpoint}
                src={data.avatar_url}
                alt={name}
                variant="rounded"
                size={38}
                fit="cover"
                roundedRadius={0}
                disableHover={true}
                cache="cacheStorage"
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
                    border: '1.5px solid var(--app-bg, #fff)',
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
              minWidth: 0,       // ⭐关键：允许文本收缩
              padding: 0
            }}
          >
            <YBox
              height="100%"
              justify="middle"
              align="left"
              gap={1}
              style={{ minWidth: 0 }}
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
};