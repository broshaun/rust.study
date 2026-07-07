import { useState, useEffect, useRef } from "react";
import { Stack, Textarea, Button, Flex, Text } from "@mantine/core";

export function NotificationSender({ onSend, loading }) {
  const [message, setMessage] = useState("");
  
  // 记录上一次的 loading 状态，用来判断什么时候“发送完成”
  const prevLoadingRef = useRef(loading);

  useEffect(() => {
    // 当外部 loading 从 true 变为 false 时，说明请求成功完成，此时清空输入框
    if (prevLoadingRef.current && !loading) {
      setMessage("");
    }
    prevLoadingRef.current = loading;
  }, [loading]);

  const handleSend = () => {
    if (!message.trim() || loading) return;

    const payload = {
      title: "离线通知",
      message: message.trim(),
      createdAt: Date.now(),
    };

    onSend?.(payload);
  };

  return (
    <Stack gap="xs" style={{ width: "100%" }}>
      {/* 顶部微型状态栏感的设计 */}
      <Flex align="center" gap="xs" px={4} mt="xl">
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "var(--mantine-color-blue-filled)"
          }}
        />
        <Text fw={600} c="dimmed">
          离线通知发送器
        </Text>
      </Flex>

      {/* 一体化输入与发送区域 */}
      <Stack gap="xs" style={{ width: "100%" }}>
        <Textarea
          placeholder="请输入通知内容..."
          minRows={4}
          autosize
          maxRows={8}
          value={message}
          disabled={loading} // 正在发送时禁用输入框，防止用户二次修改
          onChange={(e) => setMessage(e.currentTarget.value)}
          styles={{
            input: {
              fontSize: "16px",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid var(--mantine-color-gray-3)",
              backgroundColor: "var(--mantine-color-gray-0)",
            },
          }}
        />

        <Button
          loading={loading} // 使用外部传进来的 loading 状态
          disabled={!message.trim()}
          onClick={handleSend}
          fullWidth
          size="md"
          radius="xl"
        >
          立即发送
        </Button>
      </Stack>
    </Stack>
  );
}