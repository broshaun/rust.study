import React, { useMemo, useState, useCallback } from "react";
import {
  Box,
  Stack,
  TextInput,
  Group,
  Button,
  Text,
  Checkbox,
  ScrollArea,
  Paper,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { SafeAvatar } from "components";

const MODE_CONFIG = {
  add: {
    title: "添加群成员",
    searchPlaceholder: "搜索好友",
    emptyText: "暂无可添加好友",
    buttonText: "确认添加",
    color: "blue",
  },
  remove: {
    title: "删除群成员",
    searchPlaceholder: "搜索群成员",
    emptyText: "暂无可删除成员",
    buttonText: "确认删除",
    color: "red",
  },
};

function getUserId(user) {
  return user?.user_id || user?.id;
}

function getUserName(user) {
  return (
    user?.nikename ||
    user?.nickname ||
    user?.remark ||
    user?.email ||
    "未知用户"
  );
}

function UserSelectItem({ user, checked, color, onClick }) {
  const name = getUserName(user);

  return (
    <Paper
      component="button"
      type="button"
      withBorder
      radius="sm"
      p="xs"
      bg={checked ? `${color}.0` : undefined}
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        borderColor: checked
          ? `var(--mantine-color-${color}-3)`
          : undefined,
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          <SafeAvatar
            url={user?.avatar_url}
            size={36}
            radius="sm"
            cover
          />

          <Box style={{ minWidth: 0 }}>
            <Text size="sm" fw={500} truncate>
              {name}
            </Text>

            {user?.email && (
              <Text size="xs" c="dimmed" truncate>
                {user.email}
              </Text>
            )}
          </Box>
        </Group>

        <Checkbox checked={checked} size="xs" readOnly />
      </Group>
    </Paper>
  );
}

export function GroupMemberSelector({
  mode = "add", // remove
  users = [],
  loading = false,
  onConfirm,
}) {
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const config = MODE_CONFIG[mode] || MODE_CONFIG.add;

  const toggleUser = useCallback((userId) => {
    if (!userId) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }

      return next;
    });
  }, []);

  const visibleUsers = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    if (!text) return users;

    return users.filter((user) => {
      const userId = getUserId(user);

      if (selectedIds.has(userId)) return true;

      return [
        user?.nikename,
        user?.nickname,
        user?.remark,
        user?.email,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(text));
    });
  }, [users, keyword, selectedIds]);

  const handleConfirm = useCallback(() => {
    const userIds = [...selectedIds];

    if (!userIds.length) return;

    onConfirm?.({
      mode,
      user_ids: userIds,
      users: users.filter((user) => userIds.includes(getUserId(user))),
    });
  }, [mode, users, selectedIds, onConfirm]);

  return (
    <Box p={6} w="100%">
      <Stack gap="xs">
        <Text fw={600} size="sm">
          {config.title}
        </Text>

        <TextInput
          placeholder={config.searchPlaceholder}
          value={keyword}
          size="sm"
          leftSection={<IconSearch size={14} />}
          onChange={(e) => setKeyword(e.currentTarget.value)}
        />

        <ScrollArea h="calc(100vh - 170px)" mah={420}>
          <Stack gap={6}>
            {visibleUsers.map((user) => {
              const userId = getUserId(user);
              const checked = selectedIds.has(userId);

              return (
                <UserSelectItem
                  key={user?.id || user?.user_id}
                  user={user}
                  checked={checked}
                  color={config.color}
                  onClick={() => toggleUser(userId)}
                />
              );
            })}

            {!visibleUsers.length && (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                {config.emptyText}
              </Text>
            )}
          </Stack>
        </ScrollArea>

        <Group
          justify="space-between"
          wrap="nowrap"
          pt="xs"
          style={{
            borderTop: "1px solid var(--mantine-color-gray-2)",
          }}
        >
          <Text size="xs" c="dimmed">
            已选：
            <Text component="span" c={config.color} fw={600}>
              {selectedIds.size}
            </Text>
            人
          </Text>

          <Button
            size="xs"
            px="xl"
            color={config.color}
            loading={loading}
            disabled={!selectedIds.size}
            onClick={handleConfirm}
          >
            {config.buttonText}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}