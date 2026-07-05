import { memo, useEffect, useMemo, useState } from "react";
import {
  Stack,
  Group,
  Text,
  Button,
  Box,
  Center,
  Loader,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { SafeAvatar } from "components";

const STATE = {
  AWAIT: "await",
  REFUSE: "refuse",
  DELETE: "delete",
  AGREE: "agree",
  LEAVE: "leave",
};

const STATUS_MAP = {
  [STATE.AWAIT]: { label: "待通过", color: "blue" },
  [STATE.AGREE]: { label: "已通过", color: "green" },
  [STATE.REFUSE]: { label: "已拒绝", color: "gray" },
  [STATE.DELETE]: { label: "已删除", color: "red" },
  [STATE.LEAVE]: { label: "已离开", color: "orange" },
};

const VALID_STATES = Object.values(STATE);

function resolveStatus(states) {
  if (!Array.isArray(states)) return STATE.AWAIT;

  for (let i = states.length - 1; i >= 0; i--) {
    if (VALID_STATES.includes(states[i])) return states[i];
  }

  return STATE.AWAIT;
}

function StatusRibbon({ status }) {
  return (
    <Box
      style={{
        position: "absolute",
        top: 8,
        right: -30,
        width: 100,
        height: 22,
        lineHeight: "22px",
        textAlign: "center",
        fontSize: 10,
        fontWeight: 600,
        color: "white",
        backgroundColor: `var(--mantine-color-${status.color}-6)`,
        transform: "rotate(45deg)",
        transformOrigin: "center",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {status.label}
    </Box>
  );
}

const FriendRequestItem = memo(
  function FriendRequestItem({ user, onAcceptFriend, onRejectFriend }) {
    const serverStatus = useMemo(
      () => resolveStatus(user?.ask_state),
      [user?.ask_state]
    );

    const [localStatus, setLocalStatus] = useState(serverStatus);
    const [loadingAction, setLoadingAction] = useState(null);

    useEffect(() => {
      setLocalStatus(serverStatus);
      setLoadingAction(null);
    }, [serverStatus, user?.updated_at]);

    if (!user) return null;

    const status = STATUS_MAP[localStatus] || STATUS_MAP[STATE.AWAIT];
    const isPending = localStatus === STATE.AWAIT;
    const isLocked = !isPending || Boolean(loadingAction);

    const handleAction = async (action) => {
      if (isLocked) return;

      const previousStatus = localStatus;
      const handler = action === STATE.AGREE ? onAcceptFriend : onRejectFriend;

      try {
        setLoadingAction(action);
        setLocalStatus(action); // 关键：点击后立即变成最终状态，按钮消失，不可再操作
        await handler?.(user);
      } catch (error) {
        setLocalStatus(previousStatus); // 失败回滚
      } finally {
        setLoadingAction(null);
      }
    };

    return (
      <Box
        py="sm"
        px="sm"
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: isPending ? "white" : "var(--mantine-color-gray-0)",
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          opacity: isPending ? 1 : 0.72,
        }}
      >
        <StatusRibbon status={status} />

        <Group align="flex-start" wrap="nowrap" gap="sm" pr={34}>
          <SafeAvatar size={46} stretch url={user.avatar_url} />

          <Box flex={1} style={{ minWidth: 0 }}>
            <Text size="10px" c="gray.5" lh={1.2}>
              {user.updated_at || ""}
            </Text>

            <Text fw={600} size="sm" truncate mt={4}>
              {user.nickname || "未知用户"}
            </Text>

            <Text size="xs" c="dimmed" truncate mt={4}>
              {user.email || "-"}
            </Text>
          </Box>
        </Group>

        {isPending && (
          <Group justify="flex-end" mt="xs" gap="xs">
            <Button
              size="xs"
              radius="xl"
              variant="light"
              color="gray"
              loading={loadingAction === STATE.REFUSE}
              disabled={isLocked}
              onClick={() => handleAction(STATE.REFUSE)}
              styles={{
                root: {
                  height: 28,
                  padding: "0 14px",
                },
              }}
            >
              拒绝
            </Button>

            <Button
              size="xs"
              radius="xl"
              loading={loadingAction === STATE.AGREE}
              disabled={isLocked}
              onClick={() => handleAction(STATE.AGREE)}
              styles={{
                root: {
                  height: 28,
                  padding: "0 16px",
                },
              }}
            >
              通过
            </Button>
          </Group>
        )}
      </Box>
    );
  },
  (prev, next) =>
    prev.user?.updated_at === next.user?.updated_at &&
    prev.user?.ask_state === next.user?.ask_state &&
    prev.onAcceptFriend === next.onAcceptFriend &&
    prev.onRejectFriend === next.onRejectFriend
);

export const FriendRequestList = memo(function FriendRequestList({
  isLoadingRequests = false,
  isRefetching = false,
  friendRequests = [],
  onRefetch,
  onAcceptFriend,
  onRejectFriend,
}) {
  const visibleRequests = useMemo(
    () => friendRequests.filter(Boolean),
    [friendRequests]
  );

  if (isLoadingRequests) {
    return (
      <Center py="lg">
        <Loader size="sm" />
      </Center>
    );
  }

  return (
    <Box bg="white">
      <style>
        {`
          @keyframes friend-refresh-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <Group
        justify="space-between"
        wrap="nowrap"
        px="sm"
        py="xs"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          backgroundColor: "white",
          borderBottom: "1px solid var(--mantine-color-gray-2)",
        }}
      >
        <Text fw={600} size="sm">
          好友请求
        </Text>

        <Box
          component="button"
          type="button"
          aria-label="刷新好友请求"
          disabled={isRefetching}
          onClick={onRefetch}
          style={{
            border: "none",
            background: "transparent",
            padding: 4,
            width: 30,
            height: 30,
            borderRadius: 999,
            cursor: isRefetching ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
            outline: "none",
            boxShadow: "none",
          }}
        >
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformOrigin: "center",
              animation: isRefetching
                ? "friend-refresh-spin 0.8s linear infinite"
                : undefined,
            }}
          >
            <IconRefresh size={17} />
          </Box>
        </Box>
      </Group>

      {!visibleRequests.length ? (
        <Text size="xs" c="dimmed" ta="center" py="xl">
          暂无好友请求
        </Text>
      ) : (
        <Stack gap={0}>
          {visibleRequests.map((user) => (
            <FriendRequestItem
              key={user.id}
              user={user}
              onAcceptFriend={onAcceptFriend}
              onRejectFriend={onRejectFriend}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
});