import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core';

export function PushdeerEditPage({ value = '', onClick }) {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);

  const maxLength = 100;
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

  // 显示时隐藏中间 key
  const maskedValue = value
    ? `${value.slice(0, 8)}****${value.slice(-6)}`
    : '未设置';

  return (
    <Box mih="100vh" px="md" py={80} bg="gray.0">
      <Paper maw={500} mx="auto" p="xl" radius="lg" shadow="sm" withBorder>
        <Stack gap="lg">
          <Box>
            <Text size="xl" fw={700}>
              修改 Pushdeer Key
            </Text>
            <Text size="sm" c="dimmed" mt={6}>
              用于接收 Pushdeer 推送通知，可在 Pushdeer App 中获取
            </Text>
          </Box>

          <TextInput
            ref={inputRef}
            label="PushKey"
            placeholder="请输入 Pushdeer PushKey"
            value={inputValue}
            maxLength={maxLength}
            radius="md"
            error={inputValue && !trimmedValue ? 'PushKey 不能为空' : null}
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
              当前：{maskedValue}
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