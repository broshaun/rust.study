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

const UserCard = memo(function UserCard({
  title,
  user,
  actionText,
  refuseText,
  onAction,
  background = "#FFF9E8",
}) {
  if (!user) return null;

  const name =
    user?.remark ||
    user?.nickname ||
    user?.email ||
    "未知用户";

  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      bg={background}
    >
      <Card.Section
        withBorder
        inheritPadding
        py="xs"
      >
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
                onClick={() => onAction?.("refuse")}
              >
                {refuseText}
              </Button>
            )}

            {actionText && (
              <Button
                color="blue"
                size="xs"
                onClick={() => onAction?.("accept")}
              >
                {actionText}
              </Button>
            )}
          </Group>
        </Group>
      </Card.Section>

      <Group gap="sm" mt="sm" wrap="nowrap">
        <SafeAvatar
          size={60}
          stretch
          url={user?.avatar_url}
        />

        <Box flex={1}>
          <Text fw={500}>
            {name}
          </Text>

          <Text
            size="xs"
            c="dimmed"
          >
            {user?.email || "-"}
          </Text>
        </Box>
      </Group>
    </Card>
  );
});

export const FriendFindUI = memo(function FindUI({
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
          onChange={(e) =>
            onKeywordChange?.(
              e.currentTarget.value
            )
          }
          rightSection={
            <ActionIcon
              variant="subtle"
              onClick={() =>
                onSearch?.(keyword)
              }
            >
              <IconSearch size={18} />
            </ActionIcon>
          }
        />

        <DividerLine />

        {!loading && searchResult && (
          <UserCard
            title="用户信息"
            user={searchResult}
            actionText="添加"
            onAction={() =>
              onAddFriend?.(
                searchResult?.id
              )
            }
          />
        )}

        {!loadingRequest &&
          requests.map((user) => (
            <UserCard
              key={user.id}
              title="好友请求"
              user={user}
              actionText="通过"
              refuseText="拒绝"
              onAction={(type) => {
                if (type === "accept") {
                  onAccept?.(user);
                }

                if (type === "refuse") {
                  onRefuse?.(user);
                }
              }}
            />
          ))}
      </Stack>
    </ScrollArea>
  );
});