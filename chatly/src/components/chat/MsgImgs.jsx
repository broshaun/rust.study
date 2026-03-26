import React, { memo } from "react";
import { Box, Flex, Text, Stack } from "@mantine/core";
import { SafeAvatar, SafeImage } from "components/flutter";

/**
 * MsgImgs - 精简商务版图片消息
 */
export const MsgImgs = memo(({ avatar, imgUrl, previewUrl, timestamp, position = "left", virtualRow }) => {
    if (!imgUrl) return null;
    const isRight = position === "right";

    // 虚拟列表位置计算
    const style = virtualRow ? {
        position: "absolute", top: 0, left: 0, width: "100%",
        transform: `translateY(${virtualRow.start}px)`,
        height: virtualRow.size,
    } : {};

    return (
        <Box px="md" py={8} style={{ ...style, boxSizing: "border-box" }}>
            <Flex direction={isRight ? "row-reverse" : "row"} align="flex-start" gap="sm">
                {/* 头像 */}
                <SafeAvatar url={avatar} size={36} radius={6} />

                {/* 内容区 */}
                <Stack gap={4} align={isRight ? "flex-end" : "flex-start"} style={{ flex: 1 }}>
                    <Box
                        style={{
                            width: 50, height: 50, overflow: 'hidden',
                            borderRadius: isRight ? "12px 2px 12px 12px" : "2px 12px 12px 12px",
                            backgroundColor: 'var(--mantine-color-gray-0)',
                            // 移除多余边框，保持商务版极简
                        }}
                    >
                        <SafeImage
                            url={imgUrl}
                            previewUrl={previewUrl || imgUrl}
                            width="100%"
                            height="100%"
                            fit="cover"
                            radius={0}
                            allowPreview
                        />
                    </Box>

                    {/* 时间 */}
                    {timestamp && (
                        <Text size="10px" c="dimmed" opacity={0.6} px={4}>
                            {timestamp}
                        </Text>
                    )}
                </Stack>
            </Flex>
        </Box>
    );
}, (p, n) => (
    // 仅比对核心变化字段
    p.imgUrl === n.imgUrl && 
    p.avatar === n.avatar && 
    p.timestamp === n.timestamp &&
    p.virtualRow?.start === n.virtualRow?.start
));

MsgImgs.displayName = "MsgImgs";