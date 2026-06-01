import { Box, Group, Text, UnstyledButton, Stack } from "@mantine/core";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import { SafeAvatar } from "components";

function GroupMemberCard({ memberData }) {
  return (
    <Stack align="center" gap={3} w={56}>
      <SafeAvatar url={memberData?.avatar_url} size={44} radius={10} />

      <Text size="xs" ta="center" truncate w="100%">
        {memberData?.nikename || "未知用户"}
      </Text>
    </Stack>
  );
}

function ActionCard({ icon, label, onClick }) {
  return (
    <UnstyledButton onClick={onClick} w={56}>
      <Stack align="center" gap={3}>
        <Box
          w={44}
          h={44}
          style={{
            borderRadius: 10,
            border: "1px dashed var(--mantine-color-gray-4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>

        <Text size="xs" ta="center" c="dimmed" w="100%">
          {label}
        </Text>
      </Stack>
    </UnstyledButton>
  );
}

export function GroupMemberList({
  members = [],
  title = "群成员",
  onAddMember,
  onRemoveMember,
  onExitGroup,
}) {
  return (
    <Box px="xs" py={16}>
      <Group justify="space-between" mb={8}>
        <Text fw={600} size="sm">
          {title}
        </Text>

        <Text size="xs" c="dimmed">
          {members.length} 人
        </Text>
      </Group>

      <Group py={10} gap={10} rowGap={10} wrap="wrap" align="flex-start">
        {members.map((member) => (
          <GroupMemberCard
            key={member.id || member.user_id}
            memberData={member}
          />
        ))}

        <ActionCard
          label="添加"
          onClick={onAddMember}
          icon={<IconPlus size={20} stroke={1.8} />}
        />

        <ActionCard
          label="删除"
          onClick={onRemoveMember}
          icon={<IconMinus size={20} stroke={1.8} />}
        />
      </Group>

      <Box
        mt={32}
        pt="md"
        style={{
          borderTop: "1px solid var(--mantine-color-gray-2)",
        }}
      >
        <Text
          ta="center"
          c="red"
          size="sm"
          fw={500}
          onClick={onExitGroup}
          style={{
            cursor: "pointer",
            userSelect: "none",
            lineHeight: 2.4,
          }}
        >
          退出群聊
        </Text>
      </Box>
    </Box>
  );
}