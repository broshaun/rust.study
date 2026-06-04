import React, { useState } from "react";
import {
  Button,
  Stack,
  Title,
  Divider,
  Paper,
  Group,
  Center,
  Text,
  TextInput,
} from "@mantine/core";

const TextField = ({
  label,
  hintText,
  value,
  onChanged,
  maxWidth = 250,
  obscureText = false,
  disabled = false,
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
      }}
    >
      <Group gap={0} wrap="nowrap">
        {label && (
          <Center
            px="md"
            h={40}
            bg="gray.0"
            style={{
              borderRight:
                "1px solid var(--mantine-color-gray-3)",
            }}
          >
            <Text size="xs" fw={600} c="dimmed">
              {label}
            </Text>
          </Center>
        )}

        <TextInput
          value={value}
          placeholder={hintText}
          onChange={(e) =>
            onChanged?.(e.currentTarget.value)
          }
          type={obscureText ? "password" : "text"}
          variant="unstyled"
          disabled={disabled}
          h={40}
          px="sm"
          flex={1}
        />
      </Group>
    </Paper>
  );
};

export function RegisterUI({
  loading = false,
  onSubmit,
}) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    await onSubmit?.({
      account,
      password,
    });

    setAccount("");
    setPassword("");
  };

  return (
    <Stack align="center" gap="md">
      <Title order={3}>
        注册账号
      </Title>

      <Divider
        w="100%"
        styles={{
          root: {
            border: "none",
            height: 1,
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
        onChanged={setAccount}
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
        onClick={submit}
      >
        注册
      </Button>
    </Stack>
  );
}