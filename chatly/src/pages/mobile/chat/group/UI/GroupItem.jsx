import { memo, useCallback } from "react";
import {
  UnstyledButton,
  Group,
  Text,
  Box,
} from "@mantine/core";
import { SafeAvatar } from "components";

export const GroupItem = memo(function GroupItem({
  data,
  onSelect,
  onAvatarClick,
  height = 56,
}) {
  if (!data) return null;

  // console.log('data',data)

  const name = data.group_name || "未命名群聊";
  const hasNews = data.signal === "news";
  const time = data.timestamp || "";

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
      px={8}
      pos="relative"
      style={{
        transition: "background-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor =
          "var(--mantine-color-gray-0)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
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
          size={36}
          radius={8}
          cover
          onClick={handleAvatarClick}
        />

        <Box
          flex={1}
          miw={0}
          h="100%"
          style={{
            borderBottom: "1px solid var(--mantine-color-gray-2)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Text
            size="sm"
            fw={600}
            truncate
            lh={1.2}
          >
            {name}
          </Text>

          {!!time && (
            <Text
              size="11px"
              c="dimmed"
              opacity={0.7}
              truncate
              mt={3}
              lh={1.2}
            >
              {time}
            </Text>
          )}
        </Box>
      </Group>
    </UnstyledButton>
  );
});