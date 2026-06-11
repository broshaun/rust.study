import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core';

export function NicknameEditPage({ value = '', onClick }) {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);

  const maxLength = 20;
  const trimmedValue = inputValue.trim();
  const canSave = trimmedValue && trimmedValue !== value;

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    if (canSave) onClick?.(trimmedValue);
  };

  return (
    <Box mih="100vh" px="md" py={80} bg="gray.0">
      <Paper maw={420} mx="auto" p="xl" radius="lg" shadow="sm" withBorder>
        <Stack gap="lg">
          <Box>
            <Text size="xl" fw={700}>
              修改昵称
            </Text>
            <Text size="sm" c="dimmed" mt={6}>
              昵称会展示在个人资料和聊天页面中
            </Text>
          </Box>

          <TextInput
            ref={inputRef}
            label="新昵称"
            placeholder="请输入新的昵称"
            value={inputValue}
            maxLength={maxLength}
            radius="md"
            error={inputValue && !trimmedValue ? '昵称不能为空' : null}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />

          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              {inputValue.length}/{maxLength}
            </Text>

            <Text size="xs" c="dimmed">
              当前昵称：{value || '未设置'}
            </Text>
          </Group>

          <Button radius="md" disabled={!canSave} onClick={handleSave}>
            保存修改
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}