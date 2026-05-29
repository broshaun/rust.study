import { Box, Button, Group, Stack, Text, Paper, Badge } from "@mantine/core";
import { SafeAvatar } from "components/flutter";

function InviteGroupCard({ data, onAccept, onReject, loading = false }) {
  const state = data?.ask_state;

  const badgeMap = {
    invite: { label: "待处理", color: "blue" },
    agreed: { label: "已同意", color: "green" },
    rejected: { label: "已拒绝", color: "gray" },
  };

  const badge = badgeMap[state];
  const isPending = state === "invite";

  return (
    <Paper p="xs" radius="md" withBorder>
      <Group wrap="nowrap" gap="sm" align="center">
        <SafeAvatar url={data?.group_avatar} size={42} radius={9} />

        <Box flex={1} style={{ minWidth: 0 }}>
          <Group justify="space-between" wrap="nowrap" gap={6}>
            <Text fw={600} size="sm" truncate>
              {data?.group_name || "未知群聊"}
            </Text>

            {badge && (
              <Badge size="xs" variant="light" color={badge.color}>
                {badge.label}
              </Badge>
            )}
          </Group>

          <Group gap={5} mt={3} wrap="nowrap">
            <SafeAvatar url={data?.avatar_url} size={16} radius="xl" />

            <Text size="xs" c="dimmed" truncate>
              {data?.nikename || "未知用户"} 邀请你加入群聊
            </Text>
          </Group>
        </Box>
      </Group>

      {isPending && (
        <Group justify="flex-end" gap={6} mt={8}>
          <Button
            size="compact-xs"
            variant="default"
            disabled={loading}
            onClick={() => onReject?.(data)}
          >
            拒绝
          </Button>

          <Button
            size="compact-xs"
            loading={loading}
            onClick={() => onAccept?.(data)}
          >
            同意
          </Button>
        </Group>
      )}
    </Paper>
  );
}

export function GroupInviteMessageList({
  data = [],
  loading = false,
  onAccept,
  onReject,
}) {
  if (!data.length) {
    return (
      <Box p="lg">
        <Text ta="center" size="sm" c="dimmed">
          暂无入群邀请
        </Text>
      </Box>
    );
  }

  return (
    <Box p="xs">
      <Stack gap="xs">
        {data.map((item) => (
          <InviteGroupCard
            key={item.id}
            data={item}
            loading={loading}
            onAccept={onAccept}
            onReject={onReject}
          />
        ))}
      </Stack>
    </Box>
  );
}