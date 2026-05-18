import React, { useState, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Box,
  TextInput,
  ScrollArea,
  Paper,
  Group,
  ActionIcon,
  Collapse,
  Divider
} from '@mantine/core';
import { IconSend, IconPlus } from '@tabler/icons-react';
import { MsgItem } from './MsgItem';

// 定义 ChatBox.Tools 子组件
const ChatBoxTools = ({ children }) => {
  return (
    <Group gap="sm" pt="xs" >
      {children}
    </Group>
  );
};
ChatBoxTools.displayName = 'ChatBoxTools';

export function ChatBox({
  messages = [],
  senderAvatarSrc,
  receiverAvatarSrc,
  onSend,
  onOpenTools,
  height = 600,
  children,
}) {

  const [input, setInput] = useState('');
  const [showTools, setShowTools] = useState(false);
  const viewportRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => 70,
    overscan: 10,
    // 🌟 核心修改：告诉虚拟列表使用消息的 id 作为唯一标识
    // fallback 为 index 防止因为意外情况（如某条消息缺失 id）导致的报错
    getItemKey: (index) => messages[index]?.id ?? index,
  });

  const handleSend = useCallback(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    if (onSend) {
      onSend(trimmedInput);
    }

    setInput('');
  }, [input, onSend]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 从 children 中提取出 ChatBox.Tools 组件
  const toolsComponent = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type.displayName === 'ChatBoxTools'
  );

  const handleToggleTools = () => {
    if (toolsComponent) {
      setShowTools((prev) => !prev);
    }
    if (onOpenTools) {
      onOpenTools();
    }
  };

  return (
    <Paper
      shadow="md"
      withBorder
      w="100%"
      h={height}
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <ScrollArea
        flex={1}
        p="md"
        viewportRef={viewportRef}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            
            const msg = messages[virtualRow.index];
            const prevMsg = virtualRow.index > 0 ? messages[virtualRow.index - 1] : null;

            const currentTs = new Date(msg.timestamp).getTime();
            const prevTs = prevMsg ? new Date(prevMsg.timestamp).getTime() : 0;

            const isSenderChanged = !prevMsg || prevMsg.sentByMe !== msg.sentByMe;
            const isTimeGapLarge = prevMsg && (currentTs - prevTs > 3 * 60 * 1000);
            const showAvatar = isSenderChanged || isTimeGapLarge;

            return (
              <div
                key={virtualRow.key} 
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                  paddingBottom: showAvatar ? 16 : 4,
                }}
              >
                <MsgItem
                  msg = {msg}
                  avatarSrc={msg.sentByMe ? senderAvatarSrc : receiverAvatarSrc}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            size="lg"
            radius="md"
            onClick={handleToggleTools}
            style={{
              transform: showTools ? 'rotate(45deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          >
            <IconPlus size={18} />
          </ActionIcon>

          <TextInput
            placeholder="输入消息..."
            flex={1}
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />

          <ActionIcon
            variant="filled"
            color="blue"
            size="lg"
            radius="md"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>

        {/* 动态渲染工具栏，带有平滑折叠动画 */}
        {toolsComponent && (
          <Collapse in={showTools}>
            <Divider my="md" />
            <Box>
              {toolsComponent}
            </Box>
          </Collapse>
        )}
      </Box>
    </Paper>
  );
}

// 绑定子组件到主组件上
ChatBox.Tools = ChatBoxTools;