import { memo, useEffect, useState } from "react";
import {
  Stack,
  Card,
  Group,
  Text,
  Button,
  Box,
  Center,
  Loader,
  Badge,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { SafeAvatar } from "components";

const STATE = {
  AWAIT: "await",
  REFUSE: "refuse",
  DELETE: "delete",
  AGREE: "agree",
};

const STATUS_MAP = {
  [STATE.AGREE]: {
    label: "已通过",
    desc: "已通过好友请求",
    color: "green",
    disabled: true,
  },
  [STATE.REFUSE]: {
    label: "已拒绝",
    desc: "已拒绝好友请求",
    color: "gray",
    disabled: false,
  },
  [STATE.DELETE]: {
    label: "已删除",
    desc: "该好友已删除",
    color: "red",
    disabled: false,
  },
  [STATE.AWAIT]: {
    label: "待通过",
    desc: "请求添加你为好友",
    color: "blue",
    disabled: false,
  },
};

const DEFAULT_STATUS = {
  label: "未知状态",
  desc: "暂无状态信息",
  color: "gray",
  disabled: true,
};

function getRequestStatus(user) {
  const states = user.ask_state ?? [];

  if (states.includes(STATE.AGREE)) return STATUS_MAP[STATE.AGREE];
  if (states.includes(STATE.REFUSE)) return STATUS_MAP[STATE.REFUSE];
  if (states.includes(STATE.DELETE)) return STATUS_MAP[STATE.DELETE];
  if (states.includes(STATE.AWAIT)) return STATUS_MAP[STATE.AWAIT];

  return DEFAULT_STATUS;
}

const FriendRequestCard = memo(
  function FriendRequestCard({ version, user, onAcceptFriend, onRejectFriend }) {
    const [loadingAction, setLoadingAction] = useState(null);

    useEffect(() => {
      setLoadingAction(null);
    }, [version]);

    if (!user) return null;

    const status = getRequestStatus(user);
    const name = user.nickname || user.email || "未知用户";

    const handleAccept = async () => {
      if (status.disabled || loadingAction) return;

      try {
        setLoadingAction(STATE.AGREE);
        await onAcceptFriend?.(user);
      } finally {
        setLoadingAction(null);
      }
    };

    const handleReject = async () => {
      if (status.disabled || loadingAction) return;

      try {
        setLoadingAction(STATE.REFUSE);
        await onRejectFriend?.(user);
      } finally {
        setLoadingAction(null);
      }
    };

    return (
      <Card withBorder radius="lg" p="sm">
        <Group align="center" wrap="nowrap">
          <SafeAvatar size={48} stretch url={user.avatar_url} />

          <Box flex={1} style={{ minWidth: 0 }}>
            <Group gap={6} wrap="nowrap">
              <Text fw={600} size="sm" truncate>
                {name}
              </Text>

              <Badge size="xs" variant="light" color={status.color}>
                {status.label}
              </Badge>
            </Group>

            <Text size="xs" c="dimmed" truncate>
              {user.email || "-"}
            </Text>

            <Text size="xs" c="dimmed" mt={3}>
              {status.desc}
            </Text>
          </Box>
        </Group>

        {!status.disabled && (
          <Group grow mt="sm" gap="xs">
            <Button
              size="xs"
              radius="xl"
              variant="light"
              color="gray"
              loading={loadingAction === STATE.REFUSE}
              disabled={Boolean(loadingAction)}
              onClick={handleReject}
            >
              拒绝
            </Button>

            <Button
              size="xs"
              radius="xl"
              loading={loadingAction === STATE.AGREE}
              disabled={Boolean(loadingAction)}
              onClick={handleAccept}
            >
              通过
            </Button>
          </Group>
        )}
      </Card>
    );
  },
  (prev, next) =>
    prev.version === next.version &&
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
  const visibleRequests = friendRequests.filter(Boolean);

  if (isLoadingRequests) {
    return (
      <Center py="lg">
        <Loader size="sm" />
      </Center>
    );
  }

  return (
    <Stack gap="xs" p="sm">
      <style>
        {`
          @keyframes friend-refresh-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <Group justify="space-between" wrap="nowrap">
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
            margin: 0,
            width: 28,
            height: 28,
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
            <IconRefresh size={16} />
          </Box>
        </Box>
      </Group>

      {!visibleRequests.length ? (
        <Text size="xs" c="dimmed" ta="center" py="xl">
          暂无好友请求
        </Text>
      ) : (
        visibleRequests.map((user) => (
          <FriendRequestCard
            key={user.id}
            version={user.updated_at}
            user={user}
            onAcceptFriend={onAcceptFriend}
            onRejectFriend={onRejectFriend}
          />
        ))
      )}
    </Stack>
  );
});