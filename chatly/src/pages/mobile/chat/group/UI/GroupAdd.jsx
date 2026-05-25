import React, { useMemo, useState } from "react";
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
import { SafeAvatar } from "components/flutter";

export function GroupAddMember({
  users = [],
  loading = false,
  onConfirm,
}) {
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const toggleUser = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const visibleUsers = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    if (!text) return users;

    return users.filter((user) => {
      const checked = selectedIds.has(user.id);

      if (checked) return true;

      return [
        user.nickname,
        user.remark,
        user.email,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(text));
    });
  }, [users, keyword, selectedIds]);

  const handleConfirm = () => {
    onConfirm?.({
      user_ids: [...selectedIds],
    });
  };

  return (
    <Box p={6} w="100%">
      <Stack gap="xs">
        <TextInput
          placeholder="搜索好友"
          value={keyword}
          size="sm"
          leftSection={<IconSearch size={14} />}
          onChange={(e) => setKeyword(e.currentTarget.value)}
        />

        <ScrollArea h={340}>
          <Stack gap={6}>
            {visibleUsers.map((user) => {
              const checked = selectedIds.has(user.id);
              const name = user.nickname || user.remark || user.email || "未知用户";

              return (
                <Paper
                  key={user.id}
                  component="button"
                  type="button"
                  withBorder
                  radius="sm"
                  p="xs"
                  bg={checked ? "blue.0" : undefined}
                  onClick={() => toggleUser(user.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    borderColor: checked
                      ? "var(--mantine-color-blue-3)"
                      : undefined,
                  }}
                >
                  <Group justify="space-between" wrap="nowrap" gap="xs">
                    <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                      <SafeAvatar
                        url={user.avatar_url}
                        size={36}
                        radius="sm"
                        cover
                      />

                      <Box style={{ minWidth: 0 }}>
                        <Text size="sm" fw={500} truncate>
                          {name}
                        </Text>

                        {user.email && (
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
            })}
          </Stack>
        </ScrollArea>

        <Group
          justify="space-between"
          wrap="nowrap"
          pt="xs"
          style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
        >
          <Text size="xs" c="dimmed">
            已选：
            <Text component="span" c="blue" fw={600}>
              {selectedIds.size}
            </Text>
            人
          </Text>

          <Button
            size="xs"
            px="xl"
            loading={loading}
            disabled={!selectedIds.size}
            onClick={handleConfirm}
          >
            确认添加
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}