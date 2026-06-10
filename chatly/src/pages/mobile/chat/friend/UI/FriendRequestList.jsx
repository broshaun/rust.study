import { memo, useState } from "react";
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
import { SafeAvatar } from "components";

const STATE = {
  AWAIT: "await",
  REFUSE: "refuse",
  DELETE: "delete",
  AGREE: "agree",
};

function getStates(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function hasState(user, state) {
  return getStates(user?.ask_state).includes(state);
}

function getRequestStatus(user, localStatus) {
  if (localStatus === STATE.AGREE) {
    return {
      label: "已通过",
      desc: "已通过好友请求",
      color: "green",
      disabled: true,
    };
  }

  if (localStatus === STATE.REFUSE) {
    return {
      label: "已拒绝",
      desc: "已拒绝好友请求",
      color: "gray",
      disabled: true,
    };
  }

  if (hasState(user, STATE.AGREE)) {
    return {
      label: "已通过",
      desc: "已通过好友请求",
      color: "green",
      disabled: true,
    };
  }

  if (hasState(user, STATE.REFUSE)) {
    return {
      label: "已拒绝",
      desc: "已拒绝好友请求",
      color: "gray",
      disabled: true,
    };
  }

  if (hasState(user, STATE.DELETE)) {
    return {
      label: "已删除",
      desc: "该好友请求已删除",
      color: "red",
      disabled: true,
    };
  }

  return {
    label: "待通过",
    desc: "请求添加你为好友",
    color: "blue",
    disabled: false,
  };
}

const FriendRequestCard = memo(function FriendRequestCard({
  user,
  onAcceptFriend,
  onRejectFriend,
}) {
  const [localStatus, setLocalStatus] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  if (!user) return null;

  const status = getRequestStatus(user, localStatus);
  const name = user?.nickname || user?.email || "未知用户";

  const handleAccept = async () => {
    if (status.disabled) return;

    try {
      setLoadingAction(STATE.AGREE);
      await onAcceptFriend?.(user);
      setLocalStatus(STATE.AGREE);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    if (status.disabled) return;

    try {
      setLoadingAction(STATE.REFUSE);
      await onRejectFriend?.(user);
      setLocalStatus(STATE.REFUSE);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Card withBorder radius="lg" p="sm">
      <Group align="center" wrap="nowrap">
        <SafeAvatar size={48} stretch url={user?.avatar_url} />

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
            {user?.email || "-"}
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
});

export const FriendRequestList = memo(function FriendRequestList({
  isLoadingRequests = false,
  friendRequests = [],

  onAcceptFriend,
  onRejectFriend,
}) {
  if (isLoadingRequests) {
    return (
      <Center py="lg">
        <Loader size="sm" />
      </Center>
    );
  }

  const visibleRequests = friendRequests.filter(
    (user) => user && !hasState(user, STATE.DELETE)
  );

  if (!visibleRequests.length) {
    return (
      <Text size="xs" c="dimmed" ta="center" py="xl">
        暂无好友请求
      </Text>
    );
  }

  return (
    <Stack gap="xs" p="sm">
      {visibleRequests.map((user) => (
        <FriendRequestCard
          key={user.id}
          user={user}
          onAcceptFriend={onAcceptFriend}
          onRejectFriend={onRejectFriend}
        />
      ))}
    </Stack>
  );
});