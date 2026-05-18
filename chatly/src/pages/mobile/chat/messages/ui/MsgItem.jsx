import { Group, Paper, Text, Stack, Box } from '@mantine/core';
import { SafeAvatar,SafeImage } from 'components/flutter';
import { ActionIcon, Box } from "@mantine/core";
import { IconPhoneIncoming, IconPhoneOff } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from "react";

// ==========================================
// 1. 内容渲染子组件
// ==========================================
const TextContent = ({ content }) => (
  <Text style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 14, lineHeight: 1.5 }}>
    {content}
  </Text>
);


const ImageContent = ({ content }) => (
  <SafeImage
    url={content}
    previewUrl={content}
    height={50}
    radius={0}
    allowPreview
  />
);

const PhoneContent = ({ content, timestamp }) => {
  const navigate = useNavigate();

  // 解析传入的呼叫时间戳
  const callTime = new Date(timestamp.replace(' ', 'T')).getTime();

  // 根据当前时间初始化是否过期
  const [isExpired, setIsExpired] = useState(() => {
    return Date.now() - callTime > 60000;
  });

  useEffect(() => {
    // 如果初始化时就已经过期了，不需要启动定时器
    if (isExpired) return;

    // 计算距离过期的剩余时间（毫秒）
    const remainingTime = 60000 - (Date.now() - callTime);

    // 如果剩余时间大于 0，设置一个精准的定时器
    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setIsExpired(true);
      }, remainingTime);

      // 组件卸载或参数变化时清除定时器，防止内存泄漏
      return () => clearTimeout(timer);
    } else {
      setIsExpired(true);
    }
  }, [callTime, isExpired]);

  const handleConnect = () => {
    if (isExpired) return;
    navigate('/mobile/chat/message/receiver', { state: { ticket: content } });
  };

  return (
    <ActionIcon 
      variant="subtle" 
      color={isExpired ? "red" : "gray"} 
      title={isExpired ? "通话已超时" : "接收通话"} 
      disabled={isExpired}
      onClick={handleConnect}
    >
      {isExpired ? <IconPhoneOff /> : <IconPhoneIncoming />}
    </ActionIcon>
  );
};





// ==========================================
// 2. 工具函数：日期格式化
// ==========================================
const formatChatTime = (timestamp) => {
  const targetDate = new Date(timestamp);
  const now = new Date();

  const todayStart = new Date(now).setHours(0, 0, 0, 0);
  const targetStart = new Date(targetDate).setHours(0, 0, 0, 0);

  const oneDay = 86400000;
  const timeStr = targetDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

  if (targetStart === todayStart) {
    return `今天 ${timeStr}`;
  }
  if (targetStart === todayStart - oneDay) {
    return `昨天 ${timeStr}`;
  }
  if (targetStart === todayStart - 2 * oneDay) {
    return `前天 ${timeStr}`;
  }

  return `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月${targetDate.getDate()}日 ${timeStr}`;
};

// ==========================================
// 3. 主组件 MsgItem 
// ==========================================
export function MsgItem({
  timestamp,
  position,
  msgText,
  msgType,
  avatarSrc,
  showAvatar = true,
  showTime = true,
  ref
}) {

  const isRight = position === 'right';
  const renderContent = () => {
    switch (msgType) {
      case 'phone':
        return <PhoneContent content={msgText} timestamp={timestamp} />
      case 'image':
        return <ImageContent content={msgText}/>
      case 'text':
      default:
        return <TextContent content={msgText} />;
    }
  };

  // 🌟 占位符宽度需和头像大小保持一致 (40px)
  const AvatarPlaceholder = () => <Box w={40} style={{ flexShrink: 0 }} />;

  return (
    <Group
      ref={ref}
      justify={isRight ? 'flex-end' : 'flex-start'}
      align="flex-start"
      gap="xs"
      // 注意：如果你使用了上一步的 React-Virtual 虚拟列表，这里的 mb 不会生效，间距由虚拟列表的 paddingBottom 控制。
      // 如果你没用虚拟列表，这里可以通过 mb="md" 提供正常的下边距。
      wrap="nowrap"
    >
      {/* 左侧头像：接收者 (AI或客户) */}
      {!isRight && (
        showAvatar ? (
          <Box mt={4} style={{ flexShrink: 0 }}>
            {/* 🌟 使用 SafeAvatar，保持 40px 放大尺寸和方形圆角 */}
            <SafeAvatar url={avatarSrc} size={40} radius={6} />
          </Box>
        ) : <AvatarPlaceholder />
      )}

      {/* 消息主体 + 时间戳 */}
      <Stack gap={4} align={isRight ? 'flex-end' : 'flex-start'}>
        <Paper
          radius="lg"
          bg={isRight ? 'blue.6' : 'gray.1'}
          c={isRight ? 'white' : 'black'}
          shadow="xs"
          maw={300}
          style={{
            overflow: 'hidden',
            position: 'relative'
          }}
          px={msgType === 'image' ? 0 : 'sm'}
          py={msgType === 'image' ? 0 : 8}
        >
          {renderContent()}
        </Paper>

        {/* 时间戳 */}
        {showTime && (
          <Text size="10px" c="dimmed" px={4}>
            {formatChatTime(timestamp)}
          </Text>
        )}
      </Stack>

      {/* 右侧头像：发送者 (我方) */}
      {isRight && (
        showAvatar ? (
          <Box mt={4} style={{ flexShrink: 0 }}>
            {/* 🌟 使用 SafeAvatar */}
            <SafeAvatar url={avatarSrc} size={40} radius={6} />
          </Box>
        ) : <AvatarPlaceholder />
      )}
    </Group>
  );
}
