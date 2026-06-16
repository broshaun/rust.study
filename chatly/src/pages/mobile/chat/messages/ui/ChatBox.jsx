import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ActionIcon,
  Box,
  Group,
  Paper,
  ScrollArea,
  Text,
  TextInput,
  Transition,
  UnstyledButton,
} from "@mantine/core";
import { IconPlus, IconSend } from "@tabler/icons-react";

import { MsgItem } from "./MsgItem";

export function ChatBox({
  messages = [],
  onSend,
  height = 600,
  tools = [],
}) {
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [opened, setOpened] = useState(false);
  const [toolsHeight, setToolsHeight] = useState(0);

  const viewportRef = useRef(null);
  const toolsRef = useRef(null);

  const hasTools = tools.length > 0;

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => 70,
    overscan: 6,
    getItemKey: (index) => messages[index]?.id ?? index,
  });

  useEffect(() => {
    if (messages.length) {
      virtualizer.scrollToIndex(messages.length - 1);
    }
  }, [messages.length]);

  useEffect(() => {
    if (!opened || !toolsRef.current) return;

    const updateHeight = () => {
      setToolsHeight(toolsRef.current?.offsetHeight || 0);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(toolsRef.current);

    return () => observer.disconnect();
  }, [opened, tools.length]);

  const send = useCallback(() => {
    const value = input.trim();

    if (!value) return;

    onSend?.(value);

    setInput("");
  }, [input, onSend]);

  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault();
        send();
      }
    },
    [send]
  );

  return (
    <Paper
      shadow="sm"
      h={height}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          flex: 1,
          minHeight: 0,
          paddingBottom: opened ? toolsHeight : 0,
          transition: "padding-bottom 180ms ease",
        }}
        onClick={() => {
          if (opened) setOpened(false);
        }}
      >
        <ScrollArea h="100%" p="md" viewportRef={viewportRef}>
          <Box h={virtualizer.getTotalSize()} pos="relative">
            {virtualizer.getVirtualItems().map((row) => (
              <Box
                key={row.key}
                ref={virtualizer.measureElement}
                data-index={row.index}
                pos="absolute"
                left={0}
                top={0}
                w="100%"
                style={{
                  transform: `translateY(${row.start}px)`,
                  paddingBottom: 8,
                }}
              >
                <MsgItem msg={messages[row.index]} />
              </Box>
            ))}
          </Box>
        </ScrollArea>
      </Box>

      {!opened ? (
        <Box
          p="md"
          style={{
            borderTop: "1px solid var(--mantine-color-gray-3)",
            background: "var(--mantine-color-body)",
          }}
        >
          <Group gap="xs">
            <ActionIcon
              variant="light"
              size="lg"
              radius="md"
              disabled={!hasTools}
              onClick={() => setOpened(true)}
            >
              <IconPlus size={18} />
            </ActionIcon>

            <TextInput
              flex={1}
              value={input}
              placeholder="输入消息..."
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
            />

            <ActionIcon
              variant="filled"
              size="lg"
              radius="md"
              disabled={!input.trim()}
              onClick={send}
            >
              <IconSend size={18} />
            </ActionIcon>
          </Group>
        </Box>
      ) : null}

      <Transition
        mounted={opened && hasTools}
        transition="slide-up"
        duration={180}
      >
        {(styles) => (
          <Box
            ref={toolsRef}
            style={{
              ...styles,
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              background: "var(--mantine-color-body)",
              borderTop: "1px solid var(--mantine-color-gray-3)",
              padding: "10px 16px 20px",
              zIndex: 10,
            }}
          >
            <Group justify="center" mb="lg">
              <Box
                onClick={() => setOpened(false)}
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 999,
                  background: "var(--mantine-color-gray-4)",
                  cursor: "pointer",
                }}
              />
            </Group>

            <Group
              justify="space-around"
              align="flex-start"
              wrap="wrap"
              gap={4}
            >
              {tools.map(({ id, icon: Icon, label, path, color }) => (
                <UnstyledButton
                  key={id}
                  onClick={() => {
                    setOpened(false);
                    navigate(path);
                  }}
                  style={{
                    minWidth: 72,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
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
        )}
      </Transition>
    </Paper>
  );
}