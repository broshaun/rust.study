import React, { useState, useEffect, memo } from "react";
import { useNavigate } from 'react-router';
import { Group, Paper, Text, Stack, Box, ActionIcon } from '@mantine/core';
import { IconPhoneIncoming, IconPhoneOff,IconPhoneOutgoing } from '@tabler/icons-react';
import { SafeAvatar, SafeImage } from 'components/flutter';

// ==========================================
// 1. 内容渲染子组件
// ==========================================
const TextContent = memo(({ content }) => (
  <Text style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 14, lineHeight: 1.5 }}>
    {content}
  </Text>
));

const ImageContent = memo(({ content }) => (
  <SafeImage
    url={content}
    previewUrl={content}
    height={50}
    radius={0}
    allowPreview
  />
));

const PhoneContent = memo(({ content, timestamp, sentByMe }) => {
  const navigate = useNavigate();

  // console.log('sentByMe',sentByMe)
  // 强转布尔值，防止父组件传递过来的是字符串 "true" 导致判断失效
  const isSentByMe = sentByMe === true || String(sentByMe).toLowerCase() === 'true';

  // 跨端安全的日期解析
  const safeTimestamp = timestamp?.replace(/-/g, '/').replace('T', ' ') || '';
  const callTime = new Date(safeTimestamp).getTime();

  // 增加 isNaN 防护，避免时间解析失败导致状态卡死
  const [isExpired, setIsExpired] = useState(() => {
    if (isNaN(callTime)) return true; 
    return Date.now() - callTime > 60000;
  });

  useEffect(() => {
    if (isExpired || isNaN(callTime)) return;
    const remainingTime = 60000 - (Date.now() - callTime);
    if (remainingTime > 0) {
      const timer = setTimeout(() => setIsExpired(true), remainingTime);
      return () => clearTimeout(timer);
    } else {
      setIsExpired(true);
    }
  }, [callTime, isExpired]);

  // ================= 核心渲染逻辑拆分 =================

  // 1. 我发出的通话：不需要 ActionIcon 行为，直接返回静态包裹的 IconPhoneOutgoing
  if (isSentByMe) {
    return (
      <div 
        title="语音通话"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          // color: 'gray', 
          padding: '4px', // 模拟 ActionIcon 的内边距，保持 UI 对齐美观
          cursor: 'default' // 鼠标指针保持常规状态
        }}
      >
        <IconPhoneOutgoing size={20} />
      </div>
    );
  }

  // 2. 对方发出的通话：保留 ActionIcon 组件，根据是否超时动态渲染状态
  return (
    <ActionIcon
      variant="subtle"
      color={isExpired ? "red" : "green"}
      title={isExpired ? "通话已超时" : "点击接收通话"}
      disabled={isExpired}
      onClick={(e) => {
        // 阻止事件冒泡，防止点击穿透触发外层气泡组件的意外行为
        e.stopPropagation(); 
        if (!isExpired) {
          navigate('/mobile/chat/message/receiver', { state: { ticket: content } });
        }
      }}
    >
      {isExpired ? <IconPhoneOff size={20} /> : <IconPhoneIncoming size={20} />}
    </ActionIcon>
  );
});

// ==========================================
// 2. 工具函数：日期格式化
// ==========================================
const formatChatTime = (timestamp) => {
  if (!timestamp) return '';
  const safeTimestamp = timestamp.replace(/-/g, '/').replace('T', ' ');
  const d = new Date(safeTimestamp);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const timeStr = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

  const isToday = d.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const beforeYesterday = new Date(now);
  beforeYesterday.setDate(now.getDate() - 2);
  const isBeforeYesterday = d.toDateString() === beforeYesterday.toDateString();

  if (isToday) return `今天 ${timeStr}`;
  if (isYesterday) return `昨天 ${timeStr}`;
  if (isBeforeYesterday) return `前天 ${timeStr}`;

  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${timeStr}`;
};

// ==========================================
// 3. 主组件 MsgItem 
// ==========================================
export const MsgItem = memo(({
  msg,
  avatarSrc,
  ref 
}) => {

  
  if (!msg) return null;
  // console.log("msg",msg)
  console.log("avatarSrc",avatarSrc)

  const { timestamp, type, content, sentByMe } = msg;
  const isRight = sentByMe === true;

  // 映射对应的渲染组件
  const ContentComponent = type === 'phone' ? PhoneContent 
                         : type === 'image' ? ImageContent 
                         : TextContent;

  return (
    <Group
      ref={ref}
      justify={isRight ? 'flex-end' : 'flex-start'}
      align="flex-start"
      gap="xs"
      wrap="nowrap"
    >
      {/* 左侧头像：接收者 (AI或客户) */}
      {!isRight && (
        <Box w={40} mt={4} style={{ flexShrink: 0 }}>
          <SafeAvatar url={avatarSrc} size={40} radius={6} />
        </Box>
      )}

      {/* 消息主体 + 时间戳 */}
      <Stack gap={4} align={isRight ? 'flex-end' : 'flex-start'}>
        <Paper
          radius="lg"
          bg={isRight ? 'blue.6' : 'gray.1'}
          c={isRight ? 'white' : 'black'}
          shadow="xs"
          maw={300}
          style={{ overflow: 'hidden', position: 'relative' }}
          px={type === 'image' ? 0 : 'sm'}
          py={type === 'image' ? 0 : 8}
        >
          <ContentComponent content={content} timestamp={timestamp} sentByMe={sentByMe}/>
        </Paper>

        <Text size="10px" c="dimmed" px={4}>
          {formatChatTime(timestamp)}
        </Text>
      </Stack>

      {/* 右侧头像：发送者 (我方) */}
      {isRight && (
        <Box w={40} mt={4} style={{ flexShrink: 0 }}>
          <SafeAvatar url={avatarSrc} size={40} radius={6} />
        </Box>
      )}
    </Group>
  );
});

MsgItem.displayName = 'MsgItem';