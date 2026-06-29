import React, { useEffect, useRef, useState } from 'react';
import { Button, Group, Stack, Text, TextInput } from '@mantine/core';

export function NicknameEditPage({ value = '', onClick }) {
  const safeString = (v) => (v ?? '');

  const [inputValue, setInputValue] = useState(safeString(value));
  const inputRef = useRef(null);

  const maxLength = 20;

  const trimmedValue = safeString(inputValue).trim();

  const canSave =
    trimmedValue.length > 0 &&
    trimmedValue !== safeString(value).trim();

  useEffect(() => {
    setInputValue(safeString(value));
  }, [value]);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    if (!canSave) return;
    onClick?.(trimmedValue);
  };

  return (
    <div
      style={{
        padding: '16px',        // ✅ 手机安全边距（核心）
        boxSizing: 'border-box',
      }}
    >

      <Stack gap="lg">

        {/* 标题 */}
        <div>
          <Text size="xl" fw={700}>
            修改昵称
          </Text>
          <Text size="sm" c="dimmed" mt={6}>
            昵称会展示在个人资料和聊天页面中
          </Text>
        </div>

        {/* 输入框（保留边框） */}
        <TextInput
          ref={inputRef}
          label="新昵称"
          placeholder="请输入新的昵称"
          value={inputValue}
          maxLength={maxLength}
          radius="md"
          variant="default"
          error={
            inputValue && !trimmedValue
              ? '昵称不能为空'
              : null
          }
          onChange={(e) =>
            setInputValue(safeString(e.currentTarget.value))
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
        />

        {/* 信息 */}
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {safeString(inputValue).length}/{maxLength}
          </Text>

          <Text size="xs" c="dimmed">
            当前昵称：{value || '未设置'}
          </Text>
        </Group>

        {/* 保存按钮 */}
        <Button
          radius="md"
          disabled={!canSave}
          onClick={handleSave}
        >
          保存修改
        </Button>

      </Stack>
    </div>
  );
}