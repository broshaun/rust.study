import React, { useState } from "react";
import {
  Button,
  Stack,
  Title,
  Divider,
  TextInput,
  Text,
  Group,
  Paper,
  Center,
} from "@mantine/core";
import { SafeAvatar } from "components";

const TextField = ({
  label,
  hintText,
  value,
  onChanged,
  maxWidth = 250, // 提取为默认值
  obscureText = false,
  disabled = false,
  error,
}) => {
  return (
    <Paper
      withBorder
      radius="md"
      w="100%"
      maw={maxWidth}
      opacity={disabled ? 0.6 : 1}
      style={{
        overflow: "hidden",
        cursor: disabled ? "not-allowed" : "default",
        borderColor: error ? "var(--mantine-color-red-filled)" : undefined,
      }}
    >
      <Group gap={0} wrap="nowrap">
        {label && (
          <Center
            px="md"
            h={40}
            bg="gray.0"
            style={{ borderRight: "1px solid var(--mantine-color-gray-3)" }}
          >
            <Text size="xs" fw={600} c="dimmed">
              {label}
            </Text>
          </Center>
        )}

        <TextInput
          placeholder={hintText}
          value={value ?? ""}
          onChange={(e) => onChanged?.(e.currentTarget.value)}
          type={obscureText ? "password" : "text"}
          disabled={disabled}
          variant="unstyled"
          size="sm"
          flex={1}
          px="sm"
          h={40}
          autoComplete="off"
          error={typeof error === "string" ? error : !!error}
        />
      </Group>
    </Paper>
  );
};

export function LoginUI({
  avatarUrl,
  avatarVersion,
  defaultAccount = "",
  loading = false,
  onAccountChange,
  onSubmit,
}) {
  const [account, setAccount] = useState(defaultAccount);
  const [password, setPassword] = useState("");

  const handleAccountChange = (val) => {
    setAccount(val);
    onAccountChange?.(val);
  };

  return (
    // 使用 align="center" 一次性解决所有子元素的居中问题
    <Stack align="center" gap="md">
      <SafeAvatar
        url={avatarUrl}
        size={75}
        radius={100}
        cover
        version={avatarVersion}
      />

      <Title order={4}>登录界面</Title>

      <Divider
        w="100%"
        styles={{
          root: {
            border: "none",
            height: "1px",
            backgroundImage:
              "linear-gradient(to right, transparent, light-dark(rgba(0,0,0,0.12), rgba(255,255,255,0.15)) 50%, transparent)",
          },
        }}
      />

      <TextField
        label="账号"
        hintText="请输入账号"
        value={account}
        disabled={loading}
        onChanged={handleAccountChange}
      />

      <TextField
        label="密码"
        hintText="请输入密码"
        obscureText
        value={password}
        disabled={loading}
        onChanged={setPassword}
      />

      <Button
        h={42}
        w="100%"
        maw={250}
        loading={loading}
        onClick={() => onSubmit?.({ account, password })}
      >
        登录
      </Button>
    </Stack>
  );
}