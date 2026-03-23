import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import {
  Box,
  Group,
  ScrollArea,
  Textarea,
  Button,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { EmojiPicker } from "./EmojiPicker";

const ChatMsgContext = createContext(null);

export const useChatMsg = () => {
  const context = useContext(ChatMsgContext);
  if (!context) throw new Error("useChatMsg 必须在 ChatMsg 组件内使用");
  return context;
};

// ================= 主容器 =================
export const ChatMsg = ({
  children,
  width = "100%",
  height = "100%",
  style,
  className = "",
}) => {
  const { colorScheme } = useMantineColorScheme();
  const viewportRef = useRef(null);

  const api = useMemo(
    () => ({
      viewportRef,
      theme: colorScheme,
      scrollToBottom: () => {
        const el = viewportRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      },
    }),
    [colorScheme]
  );

  return (
    <ChatMsgContext.Provider value={api}>
      <Box
        className={className}
        style={{
          display: "flex",
          flexDirection: "column",
          width,
          height,
          minHeight: 0,
          overflow: "hidden",
          backgroundColor: "var(--mantine-color-body)",
          color: "var(--mantine-color-text)",
          margin: "0 auto",
          maxWidth: "1200px",
          position: "relative",
          ...style,
        }}
      >
        {children}
      </Box>
    </ChatMsgContext.Provider>
  );
};

// ================= Meta (精简优化版：仅分割线) =================
const Meta = ({ title, left, right }) => (
  <Box
    component="header"
    px="md"
    py={12}
    style={{
      flexShrink: 0,
      zIndex: 10,
      backgroundColor: "var(--mantine-color-body)",
      // 🌟 只使用底部细分割线，不使用任何边框
      borderBottom: "1px solid var(--mantine-color-default-border)",
    }}
  >
    <Group justify="space-between" wrap="nowrap">
      <Box w={60} style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {left}
      </Box>

      <Box style={{ flex: 1 }}>
        <Text
          fw={700}
          size="md"
          ta="center"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Text>
      </Box>

      <Box w={60} style={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {right}
      </Box>
    </Group>
  </Box>
);

// ================= 内容区 =================
const Content = ({ children }) => {
  const { viewportRef } = useChatMsg();

  return (
    <Box style={{ flex: 1, minHeight: 0, position: "relative" }}>
      <ScrollArea
        viewportRef={viewportRef}
        h="100%"
        scrollbarSize={6}
        type="hover"
        offsetScrollbars
      >
        {children}
      </ScrollArea>
    </Box>
  );
};

// ================= 发送区 =================
const Send = ({
  onSend,
  placeholder = "输入消息...",
  disabled = false,
  loading = false,
  maxRows = 3,
}) => {
  const [val, setVal] = useState("");
  const { scrollToBottom, theme: colorScheme } = useChatMsg();
  const textareaRef = useRef(null);

  const handleSend = async () => {
    const text = val.trim();
    if (!text || disabled || loading) return;
    onSend?.(text);
    setVal("");
    requestAnimationFrame(() => scrollToBottom());
  };

  const handleEmojiSelect = (emoji) => {
    const el = textareaRef.current;
    if (!el) return setVal((v) => v + emoji);

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = val.substring(0, start) + emoji + val.substring(end);

    setVal(next);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  return (
    <Box
      px={{ base: "xs", sm: "md" }}
      py="sm"
      style={{
        flexShrink: 0,
        backgroundColor:
          colorScheme === "dark"
            ? "var(--mantine-color-dark-7)"
            : "var(--mantine-color-gray-0)",
        // 发送区也仅使用顶部细分割线
        borderTop: "1px solid var(--mantine-color-default-border)",
      }}
    >
      <Group align="center" gap={{ base: 10, sm: "md" }} wrap="nowrap">
        <Box style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          <EmojiPicker onSelect={handleEmojiSelect} tone={colorScheme} />
        </Box>

        <Textarea
          ref={textareaRef}
          value={val}
          onChange={(e) => setVal(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={placeholder}
          disabled={disabled || loading}
          autosize
          minRows={1}
          maxRows={maxRows}
          style={{ flex: 1, minWidth: 0 }}
          styles={{
            input: {
              color: "var(--mantine-color-text)",
              backgroundColor:
                colorScheme === "dark"
                  ? "var(--mantine-color-dark-5)"
                  : "var(--mantine-color-white)",
              fontSize: "14px",
              lineHeight: "1.5",
              border: "1px solid var(--mantine-color-default-border)",
              borderRadius: "20px",
              padding: "8px 16px",
              overflow: "hidden !important",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": { display: "none" },
            },
          }}
        />

        <Box style={{ flexShrink: 0 }}>
          <Button
            onClick={handleSend}
            disabled={disabled || loading || !val.trim()}
            loading={loading}
            h={38}
            radius="xl"
            px={{ base: "md", sm: "xl" }}
            variant="filled"
          >
            发送
          </Button>
        </Box>
      </Group>
    </Box>
  );
};

ChatMsg.Meta = Meta;
ChatMsg.Content = Content;
ChatMsg.Send = Send;

export default ChatMsg;