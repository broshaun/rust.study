import { useState, useRef, useCallback, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "react-router";
import {
  Box,
  TextInput,
  ScrollArea,
  Paper,
  Group,
  ActionIcon,
  Transition,
  Divider,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconSend, IconPlus } from "@tabler/icons-react";
import { MsgItem } from "./MsgItem";
import { currentAppBar } from "utils";

export function ChatBox({
  messages = [],
  onSend,
  onOpenTools,
  height = 600,
  tools = [],
}) {
  const navigate = useNavigate();
  const setLeftPath = currentAppBar((state) => state.setLeftPath);

  const [input, setInput] = useState("");
  const [showTools, setShowTools] = useState(false);
  const viewportRef = useRef(null);
  const hasTools = Array.isArray(tools) && tools.length > 0;

  useEffect(() => {
    setLeftPath("/mobile/chat/message/");
  }, [setLeftPath]);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => 76,
    overscan: 6,
    getItemKey: useCallback(
      (index) => messages[index]?.id ?? index,
      [messages]
    ),
  });

  useEffect(() => {
    if (!messages.length) return;
    virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
  }, [messages.length, virtualizer]);

  const handleSend = useCallback(async () => {
    const value = input.trim();
    if (!value) return;
    await onSend?.(value);
    setInput("");
  }, [input, onSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key !== "Enter") return;
      if (e.shiftKey) return;
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      handleSend();
    },
    [handleSend]
  );

  const toggleTools = useCallback(() => {
    if (hasTools) setShowTools((v) => !v);
    onOpenTools?.();
  }, [hasTools, onOpenTools]);

  const handleToolClick = useCallback(
    (path) => {
      navigate(path);
      setShowTools(false);
    },
    [navigate]
  );

  return (
    <Paper
      shadow="md"
      w="100%"
      h={height}
      display="flex"
      style={{ flexDirection: "column" }}
    >
      <ScrollArea flex={1} p="md" viewportRef={viewportRef}>
        <Box h={virtualizer.getTotalSize()} w="100%" pos="relative">
          {virtualizer.getVirtualItems().map((row) => {
            const msg = messages[row.index];
            return (
              <Box
                key={row.key}
                ref={virtualizer.measureElement}
                data-index={row.index}
                pos="absolute"
                top={0}
                left={0}
                w="100%"
                style={{
                  transform: `translateY(${row.start}px)`,
                  paddingBottom: 8,
                }}
              >
                <MsgItem msg={msg} />
              </Box>
            );
          })}
        </Box>
      </ScrollArea>

      <Box
        p="md"
        style={{
          borderTop: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <Group gap="xs">
          <ActionIcon
            variant="light"
            size="lg"
            radius="md"
            onClick={toggleTools}
            disabled={!hasTools && !onOpenTools}
            style={{
              transform: showTools ? "rotate(45deg)" : "none",
              transition: "transform 0.2s ease",
            }}
          >
            <IconPlus size={18} />
          </ActionIcon>

          <TextInput
            flex={1}
            placeholder="输入消息..."
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />

          <ActionIcon
            variant="filled"
            size="lg"
            radius="md"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>

        <Transition
          mounted={showTools && hasTools}
          transition="slide-up"
          duration={200}
          timingFunction="ease"
        >
          {(transitionStyles) => (
            <div style={transitionStyles}>
              <Divider my="md" />
              {/* 外层相对定位，预留滚动条宽度，杜绝布局挤压抖动 */}
              <Box
                p="xs"
                pos="relative"
                pr="xs"
                sx={{
                  overflowX: "auto",
                  overflowY: "hidden",
                  // 滚动条悬浮在容器上层，不占用布局宽度
                  "&::-webkit-scrollbar": {
                    height: 4,
                    position: "absolute",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0,0,0,0.07)",
                    borderRadius: 999,
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "rgba(0,0,0,0.14)",
                  },
                  // Firefox 透明细滚动条
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(0,0,0,0.07) transparent",
                }}
              >
                <Group
                  justify="space-around"
                  align="flex-start"
                  wrap="nowrap"
                  gap="sm"
                  style={{ minWidth: "max-content" }}
                >
                  {tools.map(({ id, icon: Icon, label, path, color }) => (
                    <UnstyledButton
                      key={id}
                      onClick={() => handleToolClick(path)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ActionIcon
                        component="div"
                        variant="light"
                        color={color}
                        size="xl"
                        radius="md"
                      >
                        <Icon size={24} stroke={1.5} />
                      </ActionIcon>
                      <Text size="xs" fw={500} c="dimmed">
                        {label}
                      </Text>
                    </UnstyledButton>
                  ))}
                </Group>
              </Box>
            </div>
          )}
        </Transition>
      </Box>
    </Paper>
  );
}