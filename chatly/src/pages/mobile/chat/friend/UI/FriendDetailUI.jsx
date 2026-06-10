import { memo, useState } from "react";
import {
  Stack,
  Center,
  Title,
  Divider,
  Group,
  Button,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";

import {
  IconId,
  IconMail,
  IconUserEdit,
  IconChevronRight,
} from "@tabler/icons-react";

import { SafeAvatar } from "components";

const Tile = memo(function Tile({
  icon: Icon,
  label,
  value,
  onConfirm,
}) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState("");

  const editable = !!onConfirm;

  const startEdit = () => {
    if (!editable) return;

    setTemp(value || "");
    setEditing(true);
  };

  const submit = () => {
    onConfirm?.(temp);
    setEditing(false);
  };

  if (editing) {
    return (
      <Group gap={4} wrap="nowrap">
        <TextInput
          autoFocus
          value={temp}
          flex={1}
          onChange={(e) => setTemp(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        <Button
          size="compact-xs"
          onClick={submit}
        >
          确认
        </Button>
      </Group>
    );
  }

  return (
    <UnstyledButton
      w="100%"
      py={8}
      onClick={startEdit}
      style={{
        borderBottom:
          "1px solid var(--mantine-color-default-border)",
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap={6} w={80}>
          <Icon size={14} />
          <Text size="xs">
            {label}
          </Text>
        </Group>

        <Text flex={1} ta="right" truncate>
          {value || "-"}
        </Text>

        {editable && (
          <IconChevronRight
            size={12}
            opacity={0.3}
          />
        )}
      </Group>
    </UnstyledButton>
  );
});

export const FriendInfo = memo(function FriendInfo({
  friend,
  onRemarkChange,
  onChat,
  onDelete,
}) {
  if (!friend) return null;
  return (
    <Stack p={20}>
      <Center>
        <SafeAvatar
          url={friend.avatar_url}
          size={80}
          radius={8}
          cover
        />
      </Center>

      <Title order={5}>
        账户信息
      </Title>

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

      <Tile
        icon={IconId}
        label="名称"
        value={friend.nickname}
      />

      <Tile
        icon={IconMail}
        label="邮箱"
        value={friend.email}
      />

      <Tile
        icon={IconUserEdit}
        label="备注"
        value={friend.remark}
        onConfirm={onRemarkChange}
      />

      <Group
        p={10}
        gap={25}
        justify="center"
        wrap="nowrap"
      >
        <Button
          color="indigo"
          onClick={() => onChat?.(friend)}
        >
          发起聊天
        </Button>

        <Button
          color="orange"
          onClick={() => onDelete?.(friend)}
        >
          删除好友
        </Button>
      </Group>
    </Stack>
  );
});