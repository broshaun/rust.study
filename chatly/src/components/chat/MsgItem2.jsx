import React, { memo } from "react";
import { Box, Flex, Paper, Text, Stack } from "@mantine/core";
import { SafeAvatar, SafeImage } from "components/flutter";

// ==========================================
// 1. 内容渲染组件
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
    fit="contain" 
    radius={0}       
    allowPreview
  />
);
const PhoneContent = ({ content }) => (
  <Flex align="center" gap="xs" style={{ padding: "2px 0" }}>
    <Text size={16}>📞</Text>
    <Text size="sm" fw={500}>{content || "通话记录"}</Text>
  </Flex>
);

const CONTENT_COMPONENTS = {
  text: TextContent,
  image: ImageContent,
  phone: PhoneContent,
};

// ==========================================
// 2. 主容器组件 (MsgItem)
// ==========================================

export const MsgItem = memo(({
  avatar, timestamp, position = "left", virtualRow, measureElement, msgType = "text", content, bubbleProps,
}) => {
  if (!content) return null;
  const isRight = position === "right";
  const isImage = msgType === "image";
  const ContentComponent = CONTENT_COMPONENTS[msgType] || CONTENT_COMPONENTS.text;

  return (
    <div
      ref={measureElement}
      data-index={virtualRow?.index}
      style={{
        position: "absolute", top: 0, left: 0, width: "100%",
        transform: `translateY(${virtualRow?.start ?? 0}px)`,
        boxSizing: "border-box", padding: "8px 16px",
      }}
    >
      <Flex direction={isRight ? "row-reverse" : "row"} align="flex-start" gap="sm">
        <Box style={{ flexShrink: 0 }}>
          <SafeAvatar url={avatar} size={36} radius={6} />
        </Box>

        <Stack 
          gap={4} 
          align={isRight ? "flex-end" : "flex-start"} 
          style={{ 
            flex: 1, 
            minWidth: 0,
            // 🌟 关键：确保 Stack 内部的消息块不会被强制拉伸
            display: 'flex', 
            flexDirection: 'column' 
          }}
        >
          <Paper
            px={isImage ? 0 : 14}
            py={isImage ? 0 : 10}
            shadow="none"
            style={{
              // 🌟 核心修复逻辑
              display: isImage ? 'inline-flex' : 'block', // 图片模式下使用行内伸缩
              height: isImage ? 50 : 'auto',             // 强制高度 50
              width: isImage ? 'auto' : undefined,       // 宽度自动
              maxWidth: isImage ? "70%" : "85%",
              
              overflow: "hidden", 
              backgroundColor: isRight ? "var(--mantine-primary-color-filled)" : "var(--mantine-color-default-hover)",
              color: isRight ? "var(--mantine-color-white)" : "var(--mantine-color-text)",
              borderRadius: isRight ? "12px 2px 12px 12px" : "2px 12px 12px 12px",
              ...bubbleProps?.style,
            }}
            {...bubbleProps}
          >
            <ContentComponent content={content} />
          </Paper>

          {timestamp && (
            <Text 
              size="10px" 
              c="dimmed" 
              style={{ 
                opacity: 0.7, 
                padding: isRight ? "0 4px 0 0" : "0 0 0 4px",
                whiteSpace: 'nowrap'
              }}
            >
              {timestamp}
            </Text>
          )}
        </Stack>
      </Flex>
    </div>
  );
}, (p, n) => (
  p.msgType === n.msgType && p.content === n.content && p.avatar === n.avatar &&
  p.timestamp === n.timestamp && p.position === n.position &&
  p.virtualRow?.start === n.virtualRow?.start && p.virtualRow?.index === n.virtualRow?.index
));

MsgItem.displayName = "MsgItem";