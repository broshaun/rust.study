import { useState, useMemo } from "react";
import { Box, Button, Group, Stack, Text, Paper, Badge, Divider } from "@mantine/core";
import { SafeAvatar } from "components";

const BTN_STYLES = {
  root: {
    transition: "none",
    height: "24px",
    padding: "0 12px",
    fontSize: "11px",
    "&:hover": { backgroundColor: "var(--button-bg, inherit)" },
    "&:active": { opacity: 0.7 },
  },
};

// ===== 核心：从历史数组推导当前状态 =====
const resolveAskState = (arr = []) => {
  if (!Array.isArray(arr) || arr.length === 0) return "invite";

  const valid = ["invite", "agreed", "refuse", "leave"];

  for (let i = arr.length - 1; i >= 0; i--) {
    if (valid.includes(arr[i])) return arr[i];
  }

  return "invite";
};

// ===== UI映射 =====
const getStatusUI = (status) => {
  switch (status) {
    case "agreed":
      return { color: "green", text: "已加入群" };
    case "refuse":
      return { color: "gray", text: "已拒绝邀请" };
    case "leave":
      return { color: "orange", text: "已离开群" };
    default:
      return { color: "blue", text: "待处理邀请" };
  }
};

function InviteGroupCard({ data, onAccept, onReject, loading }) {
  // 当前状态（由历史推导）
  const currentStatus = useMemo(
    () => resolveAskState(data?.ask_state),
    [data?.ask_state]
  );

  const [status, setStatus] = useState(currentStatus);

  const isInvite = status === "invite";
  const ui = getStatusUI(status);

  // ===== 操作 =====
  const handleAction = async (type) => {
    if (!isInvite) return;

    const newHistory = [...(data?.ask_state || []), type];

    setStatus(type);

    try {
      const callback = type === "agreed" ? onAccept : onReject;

      await callback?.({
        ...data,
        ask_state: newHistory,
      });
    } catch (e) {
      // rollback
      setStatus(currentStatus);
    }
  };

  return (
    <Paper p={12} radius="md" withBorder bg={isInvite ? "white" : "gray.0"}>
      <Stack gap={8}>
        {/* header */}
        <Group justify="space-between" wrap="nowrap">
          <Text fz="xs" fw={700} c="blue.8" truncate>
            【{data?.group_name || "未知群聊"}】
          </Text>
          <Text fz={10} c="gray.6">
            {data?.created_at}
          </Text>
        </Group>

        <Divider color="gray.1" />

        {/* body */}
        <Group wrap="nowrap" gap={12} align="center">
          <SafeAvatar url={data?.group_avatar} size={40} radius={6} />

          <Stack gap={6} flex={1} style={{ minWidth: 0 }}>
            <Group gap={6} wrap="nowrap">
              <SafeAvatar url={data?.avatar_url} size={14} radius="xl" />
              <Text fz={13} c="dark.8" truncate>
                <Box component="span" fw={600} c="black">
                  {data?.nickname || "用户"}
                </Box>
                <Box component="span" c="gray.6">
                  {" "}邀请您进入群聊
                </Box>
              </Text>
            </Group>

            {/* actions */}
            <Group gap={6} justify="flex-end">
              {isInvite ? (
                <>
                  <Button
                    variant="light"
                    color="red"
                    styles={BTN_STYLES}
                    disabled={loading}
                    onClick={() => handleAction("refuse")}
                  >
                    拒绝
                  </Button>

                  <Button
                    variant="filled"
                    color="blue"
                    styles={BTN_STYLES}
                    loading={loading}
                    onClick={() => handleAction("agreed")}
                  >
                    同意
                  </Button>
                </>
              ) : (
                <Badge size="xs" variant="light" color={ui.color} h={18} fz={10}>
                  {ui.text}
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
    return (
      <Text ta="center" py={50} fz="xs" c="dimmed">
        暂无群聊邀请
      </Text>
    );
  }

  return (
    <Box p="sm">
      <Stack gap={10}>
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