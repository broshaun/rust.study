import React from 'react';
import { Container, Row, Column, Center, SizedBox, Avatar } from 'components/flutter';

/**
 * Friend - 紧凑型好友列表项
 */
export const Friend = ({ 
  data, 
  onSelect, 
  onAvatarClick,
  onlineStatusKey = "is_online" 
}) => {
  if (!data) return null;

  const name = data.remark || data.nikename || data.email || "未知好友";
  const email = data.email || "未绑定邮箱";
  const isOnline = !!data[onlineStatusKey];

  return (
    /* 关键修复：在外层套一个原生 div 来接收 onClick，并加上小手鼠标样式 */
    <div 
      onClick={() => onSelect?.(data)} 
      style={{ cursor: 'pointer' }}
    >
      <Container padding="6px 14px">
        <Row height={44}>
          {/* 左侧：小型头像 */}
          <div 
            onClick={(e) => {
              e.stopPropagation(); // 阻止冒泡，点头像时不会触发外层的 onSelect
              onAvatarClick?.(data);
            }}
            style={{ position: 'relative', flexShrink: 0 }}
          >
            <Avatar
              src={data.avatar_url}
              alt={name}
              variant="rounded"
              size={38}
              fit="cover"
              roundedRadius={8}
              disableHover={true}
              cache="cacheStorage"
            />
            
            {isOnline && (
              <div style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-color, #34c759)',
                border: '2px solid var(--panel-bg)',
                zIndex: 2
              }} />
            )}
          </div>

          <SizedBox width={10} />

          {/* 中间：信息区 */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Column height="100%">
              {/* 昵称 */}
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '20px'
              }}>
                {name}
              </span>
              
              {/* 邮箱 */}
              <span style={{ 
                fontSize: '11px', 
                color: 'var(--text-secondary)',
                opacity: 0.6,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '16px'
              }}>
                {email}
              </span>
            </Column>
          </div>

          <SizedBox width={4} />
        </Row>
      </Container>
    </div>
  );
};