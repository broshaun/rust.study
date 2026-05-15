import { Group, Paper, Text, Stack, Box } from '@mantine/core';
import { SafeAvatar } from 'components/flutter'; // 🌟 引入你的自定义组件
import { ActionIcon, ScrollArea, Box, Textarea, Button } from "@mantine/core";
import { IconChevronLeft, IconPhone, IconPhoneCheck, IconPhoneOutgoing, IconFlask, IconPhoneIncoming, IconPhoto } from '@tabler/icons-react';
import { Outlet, useNavigate, useOutletContext } from 'react-router';
// ==========================================
// 1. 内容渲染子组件
// ==========================================
const TextContent = ({ content }) => (
  <Text style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 14, lineHeight: 1.5 }}>
    {content}
  </Text>
);

const PhoneContent = ({ content }) => {
  const navigate = useNavigate();
  return (
    <ActionIcon variant="subtle" color="gray" title="接收通话" onClick={() => { navigate('/mobile/chat/message/receiver', { state: { ticket: content } }) }}>
      <IconPhoneIncoming />
    </ActionIcon>
  )
};



export const parseMsgContent = (msg) => {
  if (typeof msg !== 'string') {
    return { type: 'text', content: '' };
  }
  if (msg.startsWith('[image]')) {
    return { type: 'image', content: msg.slice(7), };
  }
  if (msg.startsWith('[phone]')) {
    const content = msg.slice(7).trim();
    return { type: 'phone', content: content };
  }
  return { type: 'text', content: 'msg', };
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
  avatarSrc,
  showAvatar = true,
  showTime = true,
  ref
}) {


  const isRight = position === 'right';
  const { type: msgType, content } = parseMsgContent(msgText);

  const renderContent = () => {
    switch (msgType) {
      case 'phone':
        return <PhoneContent content={content} />
      case 'text':
      default:
        return <TextContent content={content} />;
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
