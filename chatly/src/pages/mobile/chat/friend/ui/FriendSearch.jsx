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

// 辅助函数：安全获取 ask_state 数组
function getAskState(relationObj) {
  if (!relationObj || !Array.isArray(relationObj.ask_state)) return [];
  return relationObj.ask_state;
}

function isValidObject(value) {
  return value && typeof value === "object" && Object.keys(value).length > 0;
}

function getUserAction(user, isLocalPending = false) {
  if (isLocalPending) {
    return {
      text: "等待",
      status: "等待对方通过",
      type: "pending",
      disabled: true,
    };
  }

  const myState = getAskState(user?.myself);
  const friendState = getAskState(user?.friend);

  const myAwait = myState.includes("await");
  const myAgree = myState.includes("agree");
  const friendAwait = friendState.includes("await");
  const friendAgree = friendState.includes("agree");

  // 1. 双向好友：任意一方达成了 [await, agree]（请求并满足通过），或者双方都单向 agree
  const isMutualFriend =
    (myAwait && myAgree) ||
    (friendAwait && friendAgree) ||
    (myAgree && friendAgree);

  if (isMutualFriend) {
    return {
      text: "发起请求",
      status: "已是好友",
      type: "add",
      disabled: false,
    };
  }

  // 2. 我申请了对方，对方还没通过：我方有 await 且未满足双向
  if (myAwait && !myAgree) {
    return {
      text: "等待",
      status: "等待对方通过",
      type: "pending",
      disabled: true,
    };
  }

  // 3. 对方申请了我，等待我处理：对方有 await 且未满足双向
  if (friendAwait && !friendAgree) {
    return {
      text: "去处理",
      status: "对方请求添加你",
      type: "received",
      disabled: false, // 改为 false，允许用户点击去处理（如果 onAddFriend 支持该操作）
    };
  }

  // 4. 对方单向加了我 (friend 为 ["agree"])，或者纯陌生人状态
  if (friendAgree && !myAgree) {
    return {
      text: "通过申请",
      status: "对方已将你加为好友",
      type: "add",
      disabled: false,
    };
  }

  // 5. 默认状态：未添加
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
    // 允许 "add" 类型触发操作
    if (action.type !== "add" && action.type !== "received") return;

    try {
      setIsSubmitting(true);
      await onAddFriend?.(user.id, user);
      setIsLocalPending(true);
    } catch (error) {
      console.error(error);
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
          variant={action.type === "add" ? "filled" : "light"}
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