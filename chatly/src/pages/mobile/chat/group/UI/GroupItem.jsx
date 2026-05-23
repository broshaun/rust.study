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
      style={{
        borderRadius: 10,
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