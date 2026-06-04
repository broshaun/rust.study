import { useEffect, useState, memo } from "react";
import {
  Box,
  Button,
  FileButton,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { SafeAvatar } from "components";

const emptyGroup = {
  id: "",
  group_name: "",
  group_avatar: "",
  group_notice: "",
};

const DeleteGroupContent = memo(function DeleteGroupContent({
  group,
  onDelete,
  onClose,
}) {
  const [value, setValue] = useState("");

  const groupName = group?.group_name || "";
  const matched = value.trim() === groupName;

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        请输入群名称以确认解散：
      </Text>

      <Text fw={700} c="red">
        {groupName}
      </Text>

      <TextInput
        placeholder="请输入群名称"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />

      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          取消
        </Button>

        <Button
          color="red"
          disabled={!matched}
          onClick={async () => {
            await onDelete?.(group);
            onClose?.();
          }}
        >
          确认
        </Button>
      </Group>
    </Stack>
  );
});

export const GroupEdit = memo(function GroupEdit({
  group = emptyGroup,
  loading = false,
  onUploadAvatar,
  onSubmit,
  onDelete,
}) {
  const [form, setForm] = useState(emptyGroup);
  const [deleteOpened, setDeleteOpened] = useState(false);

  useEffect(() => {
    setForm({
      id: group?.id || "",
      group_name: group?.group_name || "",
      group_avatar: group?.group_avatar || "",
      group_notice: group?.group_notice || "",
    });
  }, [
    group?.id,
    group?.group_name,
    group?.group_avatar,
    group?.group_notice,
    group?.updated_at,
  ]);

  const updateField = (key, value) => {
    setForm((prev) => {
      if (prev[key] === value) return prev;

      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handleAvatarChange = async (file) => {
    if (!file || !onUploadAvatar) return;

    const avatarUrl = await onUploadAvatar(file);

    if (avatarUrl) {
      updateField("group_avatar", avatarUrl);
    }
  };

  const handleSubmit = async () => {
    const groupName = form.group_name?.trim();

    if (!groupName) return;

    await onSubmit?.({
      ...form,
      group_name: groupName,
    });
  };

  return (
    <Box p="md" w="100%" h="100%">
      <Stack h="100%" gap="md">
        <Group wrap="nowrap" gap="md">
          <SafeAvatar
            url={form.group_avatar}
            size={72}
            radius={12}
            cover
            version={group?.updated_at}
          />

          <Stack gap={6}>
            <FileButton
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarChange}
            >
              {(props) => (
                <Button
                  {...props}
                  size="xs"
                  variant="light"
                  leftSection={<IconUpload size={14} />}
                  disabled={loading}
                >
                  更换头像
                </Button>
              )}
            </FileButton>

            <Text size="xs" c="dimmed">
              支持 JPG / PNG / WEBP
            </Text>
          </Stack>
        </Group>

        <TextInput
          label="群名称"
          placeholder="请输入群名称"
          value={form.group_name}
          disabled={loading}
          onChange={(e) => updateField("group_name", e.currentTarget.value)}
        />

        <Textarea
          label="群公告"
          placeholder="请输入群公告"
          minRows={4}
          autosize
          value={form.group_notice}
          disabled={loading}
          onChange={(e) => updateField("group_notice", e.currentTarget.value)}
        />

        <Button
          fullWidth
          loading={loading}
          disabled={!form.group_name?.trim()}
          onClick={handleSubmit}
        >
          确认修改
        </Button>

        <Box mt="auto" pt={40}>
          <Box
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
              onClick={() => setDeleteOpened(true)}
              style={{
                cursor: "pointer",
                userSelect: "none",
                lineHeight: 2.2,
              }}
            >
              解散群聊
            </Text>
          </Box>
        </Box>
      </Stack>

      <Modal
        opened={deleteOpened}
        onClose={() => setDeleteOpened(false)}
        title="解散群聊"
        centered
      >
        <DeleteGroupContent
          group={form}
          onDelete={onDelete}
          onClose={() => setDeleteOpened(false)}
        />
      </Modal>
    </Box>
  );
});