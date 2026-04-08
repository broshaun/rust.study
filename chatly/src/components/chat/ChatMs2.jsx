import React, { createContext, useContext, useMemo, useState, useRef, useEffect } from "react";
import { Box, Group, ScrollArea, Text, ActionIcon, Transition, useMantineColorScheme } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";

const ChatMsgContext = createContext(null);
export const useChatMsg = () => useContext(ChatMsgContext) || {};

// --- 样式配置中心 (易于后期维护) ---
const styles = {
  root: { display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },
  meta: { borderBottom: "1px solid var(--mantine-color-default-border)", zIndex: 200, backgroundColor: "var(--mantine-color-body)" },
  content: { flex: 1, minHeight: 0, position: "relative", zIndex: 1 },
  tool: (theme, transitionStyles) => ({
    ...transitionStyles,
    position: "absolute",
    left: 12, right: 12, bottom: 110,
    zIndex: 999,
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "var(--mantine-shadow-xl)",
    border: "1px solid var(--mantine-color-default-border)",
    backgroundColor: theme === "dark" ? "var(--mantine-color-dark-6)" : "#fff",
  }),
  send: {
    borderTop: "1px solid var(--mantine-color-default-border)",
    backgroundColor: "var(--mantine-color-body)",
    position: "relative",
    zIndex: 180,
  },
  floatBtn: (opened) => ({
    position: "absolute",
    top: -48, left: 12,
    zIndex: 190,
    boxShadow: "var(--mantine-shadow-md)",
    border: opened ? "none" : "1px solid var(--mantine-color-default-border)",
  })
};

// --- 组件定义 ---

const Meta = ({ title, left, right }) => (
  <Box component="header" px="md" py={10} style={styles.meta}>
    <Group justify="space-between" wrap="nowrap">
      <Box w={40}>{left}</Box>
      <Text fw={700} size="sm" ta="center" truncate="end" style={{ flex: 1 }}>{title}</Text>
      <Box w={40} display="flex" style={{ justifyContent: "flex-end" }}>{right}</Box>
    </Group>
  </Box>
);

const Content = ({ children }) => {
  const { viewportRef } = useChatMsg();
  return (
    <Box style={styles.content}>
      <ScrollArea viewportRef={viewportRef} h="100%" scrollbarSize={6} offsetScrollbars>
        {children}
        <Box h={80} /> {/* 避开悬浮按钮遮挡 */}
      </ScrollArea>
    </Box>
  );
};

const Tool = ({ children, onClose, onOpen }) => {
  const { toolOpened, theme } = useChatMsg();
  
  useEffect(() => {
    toolOpened ? onOpen?.() : onClose?.();
  }, [toolOpened]);

  return (
    <Transition mounted={toolOpened} transition="slide-up" duration={200}>
      {(ts) => <Box style={styles.tool(theme, ts)}>{children}</Box>}
    </Transition>
  );
};

const Send = ({ children }) => {
  const { toolOpened, setToolOpened } = useChatMsg();
  return (
    <Box px={12} pt={10} pb={12} style={styles.send}>
      <ActionIcon 
        variant={toolOpened ? "filled" : "white"} 
        color={toolOpened ? "blue" : "gray"}
        radius="xl" size={38} 
        onClick={() => setToolOpened(!toolOpened)}
        style={styles.floatBtn(toolOpened)}
      >
        {toolOpened ? <IconX size={20} /> : <IconPlus size={20} />}
      </ActionIcon>
      <Group align="flex-end" gap="xs" wrap="nowrap">{children}</Group>
    </Box>
  );
};

const ChatMsg = ({ children, width = "100%", height = "100%", style }) => {
  const { colorScheme } = useMantineColorScheme();
  const [toolOpened, setToolOpened] = useState(false);
  const viewportRef = useRef(null);

  const api = useMemo(() => ({ theme: colorScheme, toolOpened, setToolOpened, viewportRef }), [colorScheme, toolOpened]);

  return (
    <ChatMsgContext.Provider value={api}>
      <Box style={{ ...styles.root, width, height, ...style }}>{children}</Box>
    </ChatMsgContext.Provider>
  );
};

// 挂载静态组件
ChatMsg.Meta = Meta;
ChatMsg.Content = Content;
ChatMsg.Tool = Tool;
ChatMsg.Send = Send;

export default ChatMsg;