import { memo, useCallback } from "react";
import {
  UnstyledButton,
  Group,
  Stack,
  Text,
  Box,
} from "@mantine/core";
import { SafeAvatar } from "components/flutter";

export const GroupItem = memo(function GroupItem({
  data,
  onSelect,
  onAvatarClick,
  height = 52,

  // true = 绿色，false = 灰色
  hasNews = false,
}) {
  if (!data) return null;

  const name = data.group_name || "未命名群聊";
  const notice = data.group_notice || "暂无群公告";

  const handleSelect = useCallback(() => {
    onSelect?.(data);
  }, [data, onSelect]);

  const handleAvatarClick = useCallback(
    (e) => {
      e.stopPropagation();
      onAvatarClick?.(data);
    },
    [data, onAvatarClick]
  );

  return (
    <UnstyledButton
      onClick={handleSelect}
      h={height}
      w="100%"
      px={6}
      pos="relative"
      style={{
        borderRadius: 10,
        // 添加默认边框和背景、边框的颜色过渡效果
        border: "1px solid var(--mantine-color-gray-2)",
        transition: "background-color 0.15s ease, border-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor =
          "var(--mantine-color-gray-0)";
        // 鼠标移入时稍微加深边框颜色（可选，若不需要保持 gray-2 即可）
        e.currentTarget.style.borderColor = "var(--mantine-color-gray-3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        // 鼠标移出时恢复默认边框颜色
        e.currentTarget.style.borderColor = "var(--mantine-color-gray-2)";
      }}
    >
      {/* 右上角状态灯 */}
      <Box
        pos="absolute"
        top={8}
        right={8}
        w={6}
        h={6}
        bg={hasNews ? "green" : "gray.5"}
        style={{
          borderRadius: "50%",
          transition: "background-color 0.2s ease",
        }}
      />

      <Group wrap="nowrap" gap={10} h="100%">
        <SafeAvatar
          url={data.group_avatar}
          size={34}
          radius={8}
          cover
          onClick={handleAvatarClick}
        />

        <Box flex={1} miw={0}>
          <Stack gap={2}>
            <Text
              size="sm"
              fw={500}
              c="var(--text-primary)"
              truncate
              lh={1.15}
            >
              {name}
            </Text>

            <Text
              size="11px"
              c="var(--text-secondary)"
              opacity={0.68}
              truncate
              lh={1.15}
            >
              {notice}
            </Text>
          </Stack>
        </Box>
      </Group>
    </UnstyledButton>
  );
});