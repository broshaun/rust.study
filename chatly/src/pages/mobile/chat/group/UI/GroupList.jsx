import { memo } from "react";
import { Box, Text, Center, Stack } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { GroupItem } from "./GroupItem";

export const GroupList = memo(function GroupList({
  data = [],
  onSelect,
  onAvatarClick,
}) {
  if (!data.length) {
    return (
      <Center py="xl">
        <Stack gap={6} align="center" opacity={0.6}>
          <IconUsers size={26} stroke={1.5} />
          <Text size="sm" c="dimmed">
            暂无群聊
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box>
      {data.map((group) => (
        <GroupItem
          key={group.id}
          data={group}
          onSelect={onSelect}
          onAvatarClick={onAvatarClick}
        />
      ))}
    </Box>
  );
});