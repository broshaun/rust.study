import { useState } from "react";
import { Box, Button, Group, Stack, Text, Paper, Badge, Divider } from "@mantine/core";
import { SafeAvatar } from "components";

// 统一样式常量
const BTN_STYLES = {
  root: {
    transition: "none",
    height: '24px',
    padding: '0 12px',
    fontSize: '11px',
    "&:hover": { backgroundColor: "var(--button-bg, inherit)" },
    "&:active": { opacity: 0.7 },
  },
};

function InviteGroupCard({ data, onAccept, onReject, loading }) {
  const [status, setStatus] = useState(null); // 'agreed' | 'rejected' | null

  const handleAction = async (type) => {
    setStatus(type);
    const callback = type === "agreed" ? onAccept : onReject;
    try { await callback?.(data); } catch (e) { /* setStatus(null); */ }
  };

  const isDone = status !== null;

  return (
    <Paper p={12} radius="md" withBorder bg={isDone ? "gray.0" : "white"}>
      <Stack gap={8}>
        {/* 顶部：群名 & 时间 */}
        <Group justify="space-between" wrap="nowrap">
          <Text fz="xs" fw={700} c="blue.8" truncate>【{data?.group_name || "未知群聊"}】</Text>
          <Text fz={10} c="gray.6">{data?.created_at}</Text>
        </Group>

        <Divider color="gray.1" />

        {/* 内容主体 */}
        <Group wrap="nowrap" gap={12} align="center">
          <SafeAvatar url={data?.group_avatar} size={40} radius={6} />

          <Stack gap={6} flex={1} style={{ minWidth: 0 }}>
            {/* 邀请文案 */}
            <Group gap={6} wrap="nowrap">
              <SafeAvatar url={data?.avatar_url} size={14} radius="xl" />
              <Text fz={13} c="dark.8" truncate>
                <Box component="span" fw={600} c="black">{data?.nickname || "用户"}</Box>
                <Box component="span" c="gray.6"> 邀请您进入群聊</Box>
              </Text>
            </Group>

            {/* 操作区 */}
            <Group gap={6} grow={!isDone} justify="flex-end">
              {!isDone ? (
                <>
                  <Button variant="light" color="red" styles={BTN_STYLES} disabled={loading} onClick={() => handleAction("rejected")}>拒绝</Button>
                  <Button variant="filled" color="blue" styles={BTN_STYLES} loading={loading} onClick={() => handleAction("agreed")}>同意</Button>
                </>
              ) : (
                <Badge size="xs" variant="light" color={status === 'agreed' ? 'green' : 'gray'} h={18} fz={10}>
                  {status === 'agreed' ? '已同意' : '已拒绝'}
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>
      </Stack>
    </Paper>
  );
}

export function GroupInviteMessageList({ data = [], loading, onAccept, onReject }) {
  if (!data.length) {
    return <Text ta="center" py={50} fz="xs" c="dimmed">暂无群聊邀请</Text>;
  }

  return (
    <Box p="sm">
      <Stack gap={10}>
        {data.map((item) => (
          <InviteGroupCard key={item.id} data={item} loading={loading} onAccept={onAccept} onReject={onReject} />
        ))}
      </Stack>
    </Box>
  );
}