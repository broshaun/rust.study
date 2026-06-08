import { memo } from "react";
import { Box, Center, Stack, Text, Group } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { SafeAvatar } from "components";

const DAY_MS = 86400000;

/** 格式化群更新时间 */
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

  const timeStr = date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (diffDays === 0) return timeStr;
  if (diffDays === 1) return `昨天 ${timeStr}`;
  if (diffDays === 2) return `前天 ${timeStr}`;
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}月${String(date.getDate()).padStart(2, "0")}日`;
}

/** 单行群聊组件 */
const GroupRow = memo(
  function GroupRow({ group, onSelect, onAvatarClick }) {
    if (!group) return null;

    const { group_name, group_avatar, signal, timestamp } = group;
    const hasNews = signal === "news";
    const time = formatGroupTime(timestamp);

    return (
      <Box w="100%" px={8} py={6} style={{ borderRadius: 8 }}>
        <Group wrap="nowrap" gap={10} align="stretch">
          {/* 头像 */}
          <Box
            pos="relative"
            mt={3}
            style={{ cursor: onAvatarClick ? "pointer" : "default", flexShrink: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onAvatarClick?.(group);
            }}
          >
            <SafeAvatar url={group_avatar} size={38} radius={8} cover />
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

          {/* 群名和时间 */}
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
              {group_name || "未命名群聊"}
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
  /** 只在 version 或事件函数变化时渲染 */
  (prev, next) =>
    prev.version === next.version &&
    prev.onSelect === next.onSelect &&
    prev.onAvatarClick === next.onAvatarClick
);

/** 群列表组件 */
export const GroupList = memo(function GroupList({ groups = [], onSelect, onAvatarClick }) {
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

  console.log('groups',groups)
  return (
    <Box>
      {groups.map((group) => (
        <GroupRow
          key={group.id}
          group={group}
          version={group.timestamp} // 父组件控制渲染
          onSelect={onSelect}
          onAvatarClick={onAvatarClick}
        />
      ))}
    </Box>
  );
});