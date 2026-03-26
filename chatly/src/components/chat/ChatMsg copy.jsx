import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Group,
  ScrollArea,
  Textarea,
  Button,
  Text,
  ActionIcon,
  useMantineColorScheme,
  Transition,
} from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { EmojiPicker } from "./EmojiPicker";

const ChatMsgContext = createContext(null);

export const useChatMsg = () => {
  const context = useContext(ChatMsgContext);
  if (!context) throw new Error("useChatMsg 必须在 ChatMsg 组件内使用");
  return context;
};

// 通用事件逻辑合并工具
const callAll = (...fns) => (...args) => fns.forEach((fn) => fn?.(...args));

// ================= 主容器 =================
export const ChatMsg = ({ children, width = "100%", height = "100%", style, className = "" }) => {
  const { colorScheme } = useMantineColorScheme();
  const viewportRef = useRef(null);

  const api = useMemo(() => ({
    viewportRef,
    theme: colorScheme,
    scrollToBottom: () => {
      const el = viewportRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    },
  }), [colorScheme]);

  return (
    <ChatMsgContext.Provider value={api}>
      <Box
        className={className}
        style={{
          display: "flex", flexDirection: "column", width, height, minHeight: 0, overflow: "hidden",
          backgroundColor: "var(--mantine-color-body)", color: "var(--mantine-color-text)",
          margin: "0 auto", maxWidth: "1200px", position: "relative", ...style,
        }}
      >
        {children}
      </Box>
    </ChatMsgContext.Provider>
  );
};

// ================= 头部 Meta =================
const Meta = ({ title, left, right }) => (
  <Box component="header" px="md" py={10} style={{ flexShrink: 0, zIndex: 10, backgroundColor: "var(--mantine-color-body)", borderBottom: "1px solid var(--mantine-color-default-border)" }}>
    <Group justify="space-between" wrap="nowrap">
      <Box w={56} style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{left}</Box>
      <Box style={{ flex: 1, minWidth: 0 }}><Text fw={700} size="sm" ta="center" truncate="end">{title}</Text></Box>
      <Box w={56} style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>{right}</Box>
    </Group>
  </Box>
);

// ================= 内容区 =================
const Content = ({ children, bottomPadding = 0 }) => {
  const { viewportRef } = useChatMsg();
  return (
    <Box style={{ flex: 1, minHeight: 0, position: "relative" }}>
      <ScrollArea viewportRef={viewportRef} h="100%" scrollbarSize={6} type="hover" offsetScrollbars>
        <Box pb={bottomPadding}>{children}</Box>
      </ScrollArea>
    </Box>
  );
};

// ================= 工具栏 (Tool) =================
/**
 * 🌟 React 19 规范：直接接收 ref
 * 外部 API 仅暴露 onOpen, onClose, px, py, offset
 * mounted 属性由 Send 组件私有注入，不对外暴露
 */
const Tool = ({ children, px = 10, py = 6, offset = 6, onClose, onOpen, ref, ...others }) => {
  const { theme: colorScheme } = useChatMsg();

  return (
    <Transition mounted={others.mounted} transition="slide-up" duration={200}>
      {(styles) => (
        <Box
          ref={ref}
          style={{
            ...styles, position: "absolute", left: 8, right: 8, bottom: `calc(100% + ${offset}px)`, zIndex: 30,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            backgroundColor: colorScheme === "dark" ? "rgba(36, 36, 36, 0.96)" : "rgba(248, 249, 250, 0.96)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            border: "1px solid var(--mantine-color-default-border)", borderRadius: "12px", boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
          }}
        >
          <Box px={px} py={py} style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
            {children}
          </Box>
          <Box pr={8}>
            <ActionIcon variant="subtle" color="gray" radius="xl" size="sm" onClick={(e) => { e.stopPropagation(); onClose?.(); }}>
              <IconX size={14} />
            </ActionIcon>
          </Box>
        </Box>
      )}
    </Transition>
  );
};
Tool.displayName = "ChatMsg.Tool";

// ================= 文本输入区 =================
const SendText = ({ value, onChange, placeholder = "输入消息...", disabled = false, loading = false, maxRows = 3, ref }) => {
  const { theme: colorScheme } = useChatMsg();
  const internalRef = useRef(null);
  const textareaRef = ref || internalRef; // 兼容 React 19 直接传 ref

  const handleEmojiInsert = (emoji) => {
    const el = textareaRef.current;
    const current = value ?? "";
    if (!el) return onChange?.(current + emoji);
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = current.substring(0, start) + emoji + current.substring(end);
    onChange?.(next);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + emoji.length, start + emoji.length); }, 0);
  };

  return (
    <>
      <Box style={{ flexShrink: 0, display: "flex", alignItems: "center", height: 34 }}>
        <EmojiPicker onSelect={handleEmojiInsert} tone={colorScheme} />
      </Box>
      <Textarea
        ref={textareaRef} value={value} onChange={(e) => onChange?.(e.currentTarget.value)}
        placeholder={placeholder} disabled={disabled || loading} autosize minRows={1} maxRows={maxRows}
        style={{ flex: 1 }}
        styles={{ input: { backgroundColor: colorScheme === "dark" ? "var(--mantine-color-dark-5)" : "var(--mantine-color-white)", fontSize: "13px", borderRadius: "16px", padding: "6px 12px" } }}
      />
    </>
  );
};
SendText.displayName = "ChatMsg.SendText";

// ================= 发送主组件 =================
const Send = ({ button = "发送", usable = true, onClick, disabled = false, loading = false, toolIcon = <IconPlus size={16} />, children }) => {
  const [toolOpen, setToolOpen] = useState(false);
  const [text, setText] = useState("");
  const { theme: colorScheme } = useChatMsg();

  const handleSend = async () => {
    if (disabled || loading || !usable) return;
    await onClick?.(text);
    setText("");
  };

  const childArray = React.Children.toArray(children);
  const toolNode = childArray.find((c) => React.isValidElement(c) && c.type === Tool);
  const sendTextNode = childArray.find((c) => React.isValidElement(c) && c.type === SendText);

  // 状态切换逻辑
  const handleToggleTool = () => {
    const nextState = !toolOpen;
    if (nextState && toolNode?.props.onOpen) toolNode.props.onOpen();
    setToolOpen(nextState);
  };

  const renderedTool = React.isValidElement(toolNode) && React.cloneElement(toolNode, {
    mounted: toolOpen, // 🌟 私有注入显隐状态
    onClose: callAll(() => setToolOpen(false), toolNode.props.onClose),
  });

  const renderedSendText = React.isValidElement(sendTextNode) && React.cloneElement(sendTextNode, {
    value: text, onChange: callAll(setText, sendTextNode.props.onChange), disabled, loading,
  });

  return (
    <Box style={{ position: "relative", flexShrink: 0, zIndex: 20 }}>
      {renderedTool}
      <Box px={8} py={6} style={{ backgroundColor: colorScheme === "dark" ? "var(--mantine-color-dark-7)" : "var(--mantine-color-gray-0)", borderTop: "1px solid var(--mantine-color-default-border)" }}>
        <Group align="flex-end" gap={6} wrap="nowrap">
          {renderedSendText}
          <Group gap={4} wrap="nowrap">
            <ActionIcon variant={toolOpen ? "filled" : "subtle"} color={toolOpen ? "blue" : "gray"} radius="xl" size={32} onClick={handleToggleTool}>
              {toolIcon}
            </ActionIcon>
            <Button onClick={handleSend} disabled={disabled || loading || !usable} loading={loading} h={34} radius="xl" px={12}>{button}</Button>
          </Group>
        </Group>
      </Box>
    </Box>
  );
};
Send.displayName = "ChatMsg.Send";

ChatMsg.Meta = Meta;
ChatMsg.Content = Content;
ChatMsg.Tool = Tool;
ChatMsg.Send = Send;
ChatMsg.SendText = SendText;

export default ChatMsg;