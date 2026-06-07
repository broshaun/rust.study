import { memo } from "react";
import { Box, Center, Stack, Text, Group } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { SafeAvatar } from "components";

const DAY_MS = 86400000;

function formatGroupTime(timestamp) {
  if (!timestamp) return "";

  const date = new Date(
    typeof timestamp === "string" ? timestamp.replace(/-/g, "/") : timestamp
  );

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.floor((today - target) / DAY_MS);

  const time = date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (diffDays === 0) return time;
  if (diffDays === 1) return `昨天 ${time}`;
  if (diffDays === 2) return `前天 ${time}`;

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}月${String(date.getDate()).padStart(2, "0")}日`;
}

const GroupRow = memo(
  function GroupRow({ group, version, onSelect, onAvatarClick }) {
    if (!group) return null;

    const hasNews = group.signal === "news";
    const time = formatGroupTime(group.timestamp);

    return (
      <Box
        w="100%"
        px={8}
        py={6}
        style={{
          borderRadius: 8,
        }}
      >
        <Group wrap="nowrap" gap={10} align="stretch">
          <Box
            pos="relative"
            mt={3}
            style={{
              cursor: onAvatarClick ? "pointer" : "default",
              flexShrink: 0,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onAvatarClick?.(group);
            }}
          >
            <SafeAvatar url={group.group_avatar} size={38} radius={8} cover />

            {hasNews && (
              <Box
                pos="absolute"
                top={-2}
                right={-2}
                w={10}
                h={10}
                bg="green"
                style={{
                  borderRadius: "50%",
                  border: "2px solid var(--mantine-color-body)",
                  pointerEvents: "none",
                }}
              />
            )}
          </Box>

          <Box
            flex={1}
            miw={0}
            h={48}
            pos="relative"
            onClick={() => onSelect?.(group)}
            style={{
              cursor: "pointer",
              borderBottom: "1px solid var(--mantine-color-gray-2)",
            }}
          >
            <Text size="sm" fw={600} truncate pr={72} pt={4} lh={1.25}>
              {group.group_name || "未命名群聊"}
            </Text>

            {time && (
              <Text
                pos="absolute"
                top={5}
                right={0}
                size="9px"
                c="dimmed"
                opacity={0.55}
                lh={1}
              >
                {time}
              </Text>
            )}
          </Box>
        </Group>
      </Box>
    );
  },
  (prev, next) =>
    prev.version === next.version &&
    prev.onSelect === next.onSelect &&
    prev.onAvatarClick === next.onAvatarClick
);

export const GroupList = memo(function GroupList({
  groups = [],
  onSelect,
  onAvatarClick,
}) {
  if (!groups.length) {
    return (
      <Center py="xl">
        <Stack gap={6} align="center" opacity={0.6}>
          <IconUsers size={28} stroke={1.5} />

          <Text size="sm" c="dimmed">
            暂无群聊
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box>
      {groups.map((group) => (
        <GroupRow
          key={group.id}
          group={group}
          version={group?.timestamp}
          onSelect={onSelect}
          onAvatarClick={onAvatarClick}
        />
      ))}
    </Box>
  );
});