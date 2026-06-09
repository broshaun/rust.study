import { memo } from "react";
import {
  Stack,
  ScrollArea,
  Divider,
  TextInput,
  ActionIcon,
  Card,
  Group,
  Text,
  Button,
  Box,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { SafeAvatar } from "components";

const DividerLine = memo(function DividerLine() {
  return (
    <Divider
      styles={{
        root: {
          border: "none",
          height: 1,
          opacity: 0.3,
          backgroundImage:
            "linear-gradient(to right, transparent, light-dark(rgba(0,0,0,0.8), rgba(255,255,255,0.8)) 50%, transparent)",
        },
      }}
    />
  );
});

const getFriendAction = (user) => {
  const myselfState = user?.myself?.ask_state;
  const friendState = user?.friend?.ask_state;

  const isDeleted =
    user?.myself?.is_delete === true ||
    user?.friend?.is_delete === true;

  if (isDeleted || (!myselfState && !friendState)) {
    return {
      actionText: "添加",
      refuseText: null,
      statusText: isDeleted ? "好友已删除" : "未添加",
      actionType: "add",
    };
  }

  if (myselfState === "await") {
    return {
      actionText: "等待",
      refuseText: null,
      statusText: "待通过",
      actionType: "add",
    };
  }

  if (friendState === "await") {
    return {
      actionText: "通过",
      refuseText: "拒绝",
      statusText: "对方请求添加你",
      actionType: "accept",
    };
  }

  if (friendState === "agree" || myselfState === "agree") {
    return {
      actionText: "通过",
      refuseText: null,
      statusText: "已同意",
      actionType: "accept",
    };
  }

  return {
    actionText: "添加",
    refuseText: null,
    statusText: "-",
    actionType: "add",
  };
};

const UserCard = memo(function UserCard({
  title,
  user,
  onAddFriend,
  onAccept,
  onRefuse,
  background = "#FFF9E8",
}) {
  if (!user) return null;

  const name = user?.nickname || user?.email || "未知用户";

  const { actionText, refuseText, statusText, actionType } =
    getFriendAction(user);

  const handleAction = () => {
    const userId = user.id; // ✅ 最上层 id

    if (actionType === "add") {
      onAddFriend?.(userId, user);
      return;
    }

    if (actionType === "accept") {
      onAccept?.(userId, user);
    }
  };

  const handleRefuse = () => {
    const userId = user.id; // ✅ 最上层 id
    onRefuse?.(userId, user);
  };

  return (
    <Card shadow="sm" padding="sm" radius="md" bg={background}>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600} size="sm">
            {title}
          </Text>

          <Group gap={6} wrap="nowrap">
            {refuseText && (
              <Button
                color="red"
                size="xs"
                variant="light"
                onClick={handleRefuse}
              >
                {refuseText}
              </Button>
            )}

            {actionText && (
              <Button color="blue" size="xs" onClick={handleAction}>
                {actionText}
              </Button>
            )}
          </Group>
        </Group>
      </Card.Section>

      <Group gap="sm" mt="sm" wrap="nowrap">
        <SafeAvatar size={60} stretch url={user?.avatar_url} />

        <Box flex={1}>
          <Text fw={500}>{name}</Text>

          <Text size="xs" c="dimmed">
            {user?.email || "-"}
          </Text>

          <Text size="xs" c="dimmed">
            状态：{statusText}
          </Text>
        </Box>
      </Group>
    </Card>
  );
});

export const FriendFindUI = memo(function FriendFindUI({
  keyword = "",

  loading = false,
  loadingRequest = false,

  searchResult = null,
  requests = [],

  onKeywordChange,
  onSearch,

  onAddFriend,
  onAccept,
  onRefuse,
}) {
  return (
    <ScrollArea h="100%" type="auto">
      <Stack gap={10} p={10}>
        <TextInput
          placeholder="搜索好友"
          value={keyword}
          onChange={(e) => onKeywordChange?.(e.currentTarget.value)}
          rightSection={
            <ActionIcon variant="subtle" onClick={() => onSearch?.(keyword)}>
              <IconSearch size={18} />
            </ActionIcon>
          }
        />

        <DividerLine />

        {!loading && searchResult && (
          <UserCard
            title="用户信息"
            user={searchResult}
            onAddFriend={onAddFriend}
            onAccept={onAccept}
            onRefuse={onRefuse}
          />
        )}

        {!loadingRequest &&
          requests.map((user) => (
            <UserCard
              key={user.id}
              title="好友请求"
              user={user}
              onAddFriend={onAddFriend}
              onAccept={onAccept}
              onRefuse={onRefuse}
            />
          ))}
      </Stack>
    </ScrollArea>
  );
});