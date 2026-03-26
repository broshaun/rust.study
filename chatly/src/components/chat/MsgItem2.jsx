import React, { memo } from "react";
import { Box, Flex, Paper, Text, Stack } from "@mantine/core";
import { SafeAvatar } from "components/flutter";

/**
 * MsgItem - Mantine 商务版
 * 适配虚拟列表、自动主题切换、气泡方圆角设计
 */
export const MsgItem = memo(
  ({ data, receiveAvatar, sendAvatar, virtualRow }) => {
    if (!data) return null;

    const isSend = data.signal === "send";
    const currentAvatarUrl = isSend ? sendAvatar : receiveAvatar;

    // 虚拟列表样式
    const virtualStyle = virtualRow
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          transform: `translateY(${virtualRow.start}px)`,
          height: virtualRow.size,
        }
      : {};

    return (
      <Box 
        px="md" 
        py={8} 
        style={{ ...virtualStyle, boxSizing: "border-box" }}
      >
        <Flex
          direction={isSend ? "row-reverse" : "row"}
          align="flex-start"
          gap="sm"
          style={{ maxWidth: "100%" }}
        >
          {/* 头像区域 - 保持不被压缩 */}
          <Box style={{ flexShrink: 0 }}>
            <SafeAvatar
              url={currentAvatarUrl}
              size={36}
              radius={6}
              border="1px solid var(--mantine-color-default-border)"
            />
          </Box>

          {/* 消息与时间容器 */}
          <Stack 
            gap={4} 
            align={isSend ? "flex-end" : "flex-start"} 
            style={{ flex: 1, minWidth: 0 }}
          >
            {/* 消息气泡 */}
            <Paper
              px={14}
              py={10}
              shadow="none"
              style={{
                maxWidth: "85%",
                wordBreak: "break-all",
                whiteSpace: "pre-wrap",
                fontSize: "14px",
                lineHeight: 1.5,
                // 根据发送/接收状态切换气泡形状和颜色
                backgroundColor: isSend 
                  ? "var(--mantine-primary-color-filled)" 
                  : "var(--mantine-color-default-hover)",
                color: isSend 
                  ? "var(--mantine-color-white)" 
                  : "var(--mantine-color-text)",
                // 标志性的气泡角处理：发送端右上角方角，接收端左上角方角
                borderRadius: isSend 
                  ? "12px 2px 12px 12px" 
                  : "2px 12px 12px 12px",
              }}
            >
              {data.msg}
            </Paper>

            {/* 时间显示 */}
            {data.timestamp && (
              <Text 
                size="10px" 
                c="dimmed" 
                style={{ opacity: 0.7, padding: isSend ? "0 4px 0 0" : "0 0 0 4px" }}
              >
                {data.timestamp}
              </Text>
            )}
          </Stack>
        </Flex>
      </Box>
    );
  },
  // 高性能 Memo 对比
  (p, n) => (
    p.receiveAvatar === n.receiveAvatar &&
    p.sendAvatar === n.sendAvatar &&
    p.data?.id === n.data?.id &&
    p.data?.msg === n.data?.msg &&
    p.virtualRow?.start === n.virtualRow?.start
  )
);

MsgItem.displayName = "MsgItem";