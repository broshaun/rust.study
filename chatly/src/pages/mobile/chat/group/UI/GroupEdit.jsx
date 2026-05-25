import React, { useState, useEffect } from "react";
import {
  Stack,
  TextInput,
  Textarea,
  Group,
  Button,
  FileButton,
  Text,
  Box,
  Avatar,
} from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { SafeAvatar } from "components/flutter";

export function GroupEdit({
  id,
  group_name = "",
  group_avatar = "",
  group_notice = "",
  onClick,
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
    setForm({
      id,
      group_name,
      group_avatar,
      group_notice,
    });

    setPreview("");
  }, [id, group_name, group_avatar, group_notice]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleAvatarChange = (file) => {
    if (!file) return;

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);

    setForm((prev) => ({
      ...prev,
      group_avatar: file,
    }));
  };

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Box p={10} w="100%">
      <Stack gap="md">
        <Group wrap="nowrap" gap="sm">
          <Box
            w={72}
            h={72}
            style={{
              overflow: "hidden",
              borderRadius: 8,
              flexShrink: 0,
            }}
          >
            {preview ? (
              <Avatar
                src={preview}
                size={72}
                radius={8}
              />
            ) : (
              <SafeAvatar
                url={group_avatar}
                size={72}
                radius={8}
                cover
              />
            )}
          </Box>

          <Stack gap={4}>
            <FileButton
              onChange={handleAvatarChange}
              accept="image/png,image/jpeg,image/webp"
            >
              {(props) => (
                <Button
                  {...props}
                  size="xs"
                  leftSection={<IconUpload size={14} />}
                  variant="light"
                  w="fit-content"
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
          onChange={(e) => updateField("group_name", e.currentTarget.value)}
        />

        <Textarea
          label="群公告"
          placeholder="请输入群公告"
          minRows={4}
          autosize
          value={form.group_notice}
          onChange={(e) => updateField("group_notice", e.currentTarget.value)}
        />

        <Group justify="flex-end" mt="sm">
          <Button loading={loading} onClick={() => onClick?.(form)} px="xl">
            确认修改
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}