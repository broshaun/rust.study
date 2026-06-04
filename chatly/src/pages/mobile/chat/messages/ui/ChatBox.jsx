import { useState, useRef, useCallback, memo, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Box,
  TextInput,
  ScrollArea,
  Paper,
  Group,
  ActionIcon,
  Collapse,
  Divider,
} from "@mantine/core";
import { IconSend, IconPlus } from "@tabler/icons-react";
import { MsgItem } from "./MsgItem";

const ChatBoxTools = memo(({ children }) => (
  <Group gap="sm" pt="xs">
    {children}
  </Group>
));

ChatBoxTools.displayName = "ChatBoxTools";

export function ChatBox({
  messages = [],
  onSend,
  onOpenTools,
  height = 600,
  children,
}) {
  const [input, setInput] = useState("");
  const [showTools, setShowTools] = useState(false);
  const viewportRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => 70,
    overscan: 6,
    getItemKey: useCallback(
      (index) => messages[index]?.id ?? index,
      [messages]
    ),
  });

  useEffect(() => {
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1);
    }
  }, [messages.length, virtualizer]);

  const handleSend = useCallback(() => {
    const value = input.trim();
    if (!value) return;

    onSend?.(value);
    setInput("");
  }, [input, onSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const toggleTools = useCallback(() => {
    if (children) {
      setShowTools((v) => !v);
    }

    onOpenTools?.();
  }, [children, onOpenTools]);

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
            disabled={!children && !onOpenTools}
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

        {children && (
          <Collapse in={showTools}>
            <Divider my="md" />
            {children}
          </Collapse>
        )}
      </Box>
    </Paper>
  );
}

ChatBox.Tools = ChatBoxTools;