import { memo, useEffect, useState } from "react";
import {
  Stack,
  TextInput,
  ActionIcon,
  Card,
  Group,
  Text,
  Button,
  Box,
  Center,
  Loader,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { SafeAvatar } from "components";

const STATE = {
  AWAIT: "await",
  REFUSE: "refuse",
  DELETE: "delete",
  AGREE: "agree",
};

function isValidObject(value) {
  return value && typeof value === "object" && Object.keys(value).length > 0;
}

function getStates(record) {
  const value = record?.ask_state;
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function hasState(record, state) {
  return getStates(record).includes(state);
}

function getUserAction(user, isLocalPending = false) {
  const myself = user?.myself; // 我这边的好友关系
  const friend = user?.friend; // 对方那边的好友关系

  if (isLocalPending) {
    return {
      text: "等待",
      status: "等待对方通过",
      type: "pending",
      disabled: true,
    };
  }

  const hasDelete =
    hasState(myself, STATE.DELETE) || hasState(friend, STATE.DELETE);

  const hasRefuse =
    hasState(myself, STATE.REFUSE) || hasState(friend, STATE.REFUSE);

  const hasAgree =
    hasState(myself, STATE.AGREE) || hasState(friend, STATE.AGREE);

  const hasMyselfAwait = hasState(myself, STATE.AWAIT);
  const hasFriendAwait = hasState(friend, STATE.AWAIT);

  // delete 必须优先于 agree
  if (hasDelete) {
    return {
      text: "添加",
      status: "好友已删除",
      type: "add",
      disabled: false,
    };
  }

  if (hasRefuse) {
    return {
      text: "重新添加",
      status: "好友申请已拒绝",
      type: "add",
      disabled: false,
    };
  }

  if (hasAgree) {
    return {
      text: "已是好友",
      status: "已是好友",
      type: "friend",
      disabled: true,
    };
  }

  if (hasMyselfAwait) {
    return {
      text: "等待",
      status: "等待对方通过",
      type: "pending",
      disabled: true,
    };
  }

  if (hasFriendAwait) {
    return {
      text: "去处理",
      status: "对方请求添加你",
      type: "received",
      disabled: true,
    };
  }

  return {
    text: "添加",
    status: "未添加",
    type: "add",
    disabled: false,
  };
}

const SearchUserCard = memo(function SearchUserCard({ user, onAddFriend }) {
  const [isLocalPending, setIsLocalPending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLocalPending(false);
    setIsSubmitting(false);
  }, [user?.id]);

  if (!isValidObject(user)) return null;

  const action = getUserAction(user, isLocalPending);
  const name = user?.nickname || user?.email || "未知用户";

  const handleAddFriend = async () => {
    if (action.type !== "add") return;

    try {
      setIsSubmitting(true);
      await onAddFriend?.(user.id, user);
      setIsLocalPending(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card withBorder radius="lg" p="sm">
      <Group align="center" wrap="nowrap">
        <SafeAvatar size={48} stretch url={user?.avatar_url} />

        <Box flex={1} style={{ minWidth: 0 }}>
          <Text fw={600} size="sm" truncate>
            {name}
          </Text>

          <Text size="xs" c="dimmed" truncate>
            {user?.email || "-"}
          </Text>

          <Text size="xs" c="dimmed" mt={3}>
            {action.status}
          </Text>
        </Box>

        <Button
          size="xs"
          radius="xl"
          loading={isSubmitting}
          disabled={action.disabled || isSubmitting}
          onClick={handleAddFriend}
        >
          {action.text}
        </Button>
      </Group>
    </Card>
  );
});

export const FriendSearch = memo(function FriendSearch({
  keyword = "",
  isSearching = false,
  foundUser = null,

  onKeywordChange,
  onSearchUser,
  onAddFriend,
}) {
  const hasFoundUser = isValidObject(foundUser);
  const canSearch = Boolean(keyword?.trim());

  const handleSearch = () => {
    if (!canSearch) return;
    onSearchUser?.(keyword.trim());
  };

  return (
    <Stack gap="sm" p="sm">
      <TextInput
        placeholder="输入邮箱搜索好友"
        value={keyword}
        radius="xl"
        size="md"
        onChange={(e) => onKeywordChange?.(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        rightSection={
          <ActionIcon
            variant="subtle"
            loading={isSearching}
            disabled={!canSearch}
            onClick={handleSearch}
          >
            <IconSearch size={18} />
          </ActionIcon>
        }
      />

      {isSearching && (
        <Center py="lg">
          <Loader size="sm" />
        </Center>
      )}

      {!isSearching && hasFoundUser && (
        <SearchUserCard user={foundUser} onAddFriend={onAddFriend} />
      )}

      {!isSearching && !hasFoundUser && (
        <Text size="xs" c="dimmed" ta="center" py="xl">
          输入邮箱后搜索用户
        </Text>
      )}
    </Stack>
  );
});