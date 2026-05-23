import React, { memo } from "react";
import {
  Avatar,
  Box,
  Group,
  Stack,
  Text,
  UnstyledButton,
  Center,
} from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";




export const GroupList = memo(function GroupList({
  data = [],
  onSelect,
}) {
  if (!data.length) {
    return (
      <Center py="xl">
        <Stack gap={6} align="center">
          <IconUsers size={28} stroke={1.5} />
          <Text size="sm" c="dimmed">
            暂无群聊
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap={2}>
      {data.map((group) => (
        <UnstyledButton
          key={group.id}
          onClick={() => onSelect?.(group)}
          style={{
            width: "100%",
            borderRadius: 10,
            padding: "10px 12px",
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
          <Group wrap="nowrap" gap="sm">
            <Avatar
              src={group.group_avatar}
              radius="md"
              size={48}
              color="gray"
            >
              {group.group_name?.slice(0, 1)}
            </Avatar>

            <Box flex={1} miw={0}>
              <Text fw={500} truncate>
                {group.group_name}
              </Text>

              <Text size="sm" c="dimmed" truncate>
                {group.group_notice || "暂无群公告"}
              </Text>
            </Box>
          </Group>
        </UnstyledButton>
      ))}
    </Stack>
  );
});