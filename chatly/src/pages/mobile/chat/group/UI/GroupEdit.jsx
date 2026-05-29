import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  FileButton,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconUpload } from "@tabler/icons-react";
import { SafeAvatar } from "components/flutter";

function DeleteGroupContent({ groupInfo, onDelete }) {
  const [value, setValue] = useState("");

  const matched = value.trim() === groupInfo.group_name;

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        请输入群名称以确认解散：
      </Text>

      <Text fw={700} c="red">
        {groupInfo.group_name}
      </Text>

      <TextInput
        placeholder="请输入群名称"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />

      <Group justify="flex-end">
        <Button variant="default" onClick={() => modals.closeAll()}>
          取消
        </Button>

        <Button
          color="red"
          disabled={!matched}
          onClick={() => {
            onDelete?.(groupInfo);
            modals.closeAll();
          }}
        >
          确认
        </Button>
      </Group>
    </Stack>
  );
}

export function GroupEdit({
  id,
  group_name = "",
  group_avatar = "",
  group_notice = "",
  onClick,
  onDelete,
  loading = false,
}) {
  const [form, setForm] = useState({
    id,
    group_name,
    group_avatar,
    group_notice,
  });

  const [preview, setPreview] = useState("");

  useEffect(() => {
    setForm({ id, group_name, group_avatar, group_notice });
    setPreview("");
  }, [id, group_name, group_avatar, group_notice]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarChange = (file) => {
    if (!file) return;

    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);

    const url = URL.createObjectURL(file);
    setPreview(url);
    updateField("group_avatar", file);
  };

  const handleSubmit = () => {
    const name = form.group_name?.trim();
    if (!name) return;

    onClick?.({
      ...form,
      group_name: name,
    });
  };

  const openDeleteModal = () => {
    modals.open({
      title: "解散群聊",
      centered: true,
      children: <DeleteGroupContent groupInfo={form} onDelete={onDelete} />,
    });
  };

  return (
    <Box p="md" w="100%" h="100%">
      <Stack h="100%" gap="md">
        <Group wrap="nowrap" gap="md">
          <Box
            w={72}
            h={72}
            style={{
              flexShrink: 0,
              overflow: "hidden",
              borderRadius: 12,
            }}
          >
            {preview ? (
              <Avatar src={preview} size={72} radius={12} />
            ) : (
              <SafeAvatar url={form.group_avatar} size={72} radius={12} cover />
            )}
          </Box>

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
          value={form.group_name || ""}
          onChange={(e) => updateField("group_name", e.currentTarget.value)}
        />

        <Textarea
          label="群公告"
          placeholder="请输入群公告"
          minRows={4}
          autosize
          value={form.group_notice || ""}
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
              onClick={openDeleteModal}
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
    </Box>
  );
}