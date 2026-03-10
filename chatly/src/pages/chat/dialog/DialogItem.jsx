import React from 'react';
import { Container, Row, Column, SizedBox, Avatar } from 'components/flutter';

/**
 * 时间格式化工具 (保持不变)
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
  if (diffDays === 0) return t.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (diffDays === 1) return "昨天";
  if (diffDays > 1 && diffDays <= 6) return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][t.getDay()];
  if (isThisYear) return `${t.getMonth() + 1}月${t.getDate()}日`;
  return `${t.getFullYear()}年${t.getMonth() + 1}月`;
};

export const DialogItem = ({ data, onSelect, onClear, onAvatarClick }) => {
  if (!data) return null;

  const name = data.remark || data.nikename || data.email || "未知联系人";
  const email = data.email || "未绑定邮箱";
  const timeStr = formatDialogTime(data.timestamp);
  const isNew = data.signal === "new";

  return (
    <div onClick={() => onSelect?.(data)} style={{ cursor: 'pointer' }}>
      {/* 1. Padding 必须是 6px 14px */}
      <Container padding="6px 14px">
        {/* 2. Height 必须是 44 */}
        <Row height={44}>
          
          {/* 左侧头像：尺寸 38，半径 8 */}
          <div 
            onClick={(e) => { e.stopPropagation(); onAvatarClick?.(data); }}
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
          </div>

          <SizedBox width={10} />

          {/* 3. 中间信息区：使用 Column 确保文字偏移量与 Friend 完全一致 */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Column height="100%">
              {/* 昵称：样式与 Friend 完全对齐 */}
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '20px' // 关键：与 Friend 一致
              }}>
                {name}
              </span>
              
              {/* 邮箱：样式与 Friend 完全对齐 */}
              <span style={{ 
                fontSize: '11px', 
                color: 'var(--text-secondary)',
                opacity: 0.6, // 关键：与 Friend 一致
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '16px' // 关键：与 Friend 一致
              }}>
                {email}
              </span>
            </Column>
          </div>

          <SizedBox width={8} />

          {/* 4. 右侧：操作区 (高度设为 100% 并在 Column 内垂直居中) */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end', 
            justifyContent: 'center', // 垂直居中，不破坏行高感
            flexShrink: 0,
            height: '100%'
          }}>
            <span style={{ 
              fontSize: '10px', 
              color: 'var(--text-secondary)', 
              opacity: 0.4,
              marginBottom: '2px'
            }}>
              {timeStr}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isNew && (
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-color, #ff3b30)',
                }} />
              )}
              <div 
                onClick={(e) => { e.stopPropagation(); onClear?.(data); }}
                style={{ 
                  fontSize: '12px', 
                  color: 'var(--text-secondary)', 
                  opacity: 0.3,
                  width: '14px',
                  height: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </div>
            </div>
          </div>
        </Row>
      </Container>
    </div>
  );
};