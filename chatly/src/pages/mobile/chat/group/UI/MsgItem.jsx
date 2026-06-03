import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router";
import { Group, Paper, Text, Stack, Box, ActionIcon } from "@mantine/core";
import {
  IconPhoneIncoming,
  IconPhoneOff,
  IconPhoneOutgoing,
} from "@tabler/icons-react";
import { SafeAvatar, SafeImg30 } from "components";

const TextContent = memo(({ content }) => (
  <Text
    style={{
      margin: 0,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      fontSize: 14,
      lineHeight: 1.5,
    }}
  >
    {content}
  </Text>
));

const ImageContent = memo(({ content }) => (
  <SafeImg30
    url={content}
    previewUrl={content}
    height={50}
    radius={0}
    allowPreview
  />
));

const PhoneContent = memo(({ content, timestamp, sentByMe }) => {
  const navigate = useNavigate();

  const isSentByMe =
    sentByMe === true || String(sentByMe).toLowerCase() === "true";

  const safeTimestamp = timestamp?.replace(/-/g, "/").replace("T", " ") || "";
  const callTime = new Date(safeTimestamp).getTime();

  const [isExpired, setIsExpired] = useState(() => {
    if (isNaN(callTime)) return true;
    return Date.now() - callTime > 60000;
  });

  useEffect(() => {
    if (isExpired || isNaN(callTime)) return;

    const remainingTime = 60000 - (Date.now() - callTime);

    if (remainingTime > 0) {
      const timer = setTimeout(() => setIsExpired(true), remainingTime);
      return () => clearTimeout(timer);
    }

    setIsExpired(true);
  }, [callTime, isExpired]);

  if (isSentByMe) {
    return (
      <div
        title="语音通话"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
          cursor: "default",
        }}
      >
        <IconPhoneOutgoing size={20} />
      </div>
    );
  }

  return (
    <ActionIcon
      variant="subtle"
      color={isExpired ? "red" : "green"}
      title={isExpired ? "通话已超时" : "点击接收通话"}
      disabled={isExpired}
      onClick={(e) => {
        e.stopPropagation();

        if (!isExpired) {
          navigate("/mobile/chat/message/receiver", {
            state: { ticket: content },
          });
        }
      }}
    >
      {isExpired ? (
        <IconPhoneOff size={20} />
      ) : (
        <IconPhoneIncoming size={20} />
      )}
    </ActionIcon>
  );
});

const formatChatTime = (timestamp) => {
  if (!timestamp) return "";

  const safeTimestamp = timestamp.replace(/-/g, "/").replace("T", " ");
  const d = new Date(safeTimestamp);

  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const timeStr = d.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const isToday = d.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const beforeYesterday = new Date(now);
  beforeYesterday.setDate(now.getDate() - 2);

  if (isToday) return `今天 ${timeStr}`;
  if (d.toDateString() === yesterday.toDateString()) return `昨天 ${timeStr}`;
  if (d.toDateString() === beforeYesterday.toDateString())
    return `前天 ${timeStr}`;

  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${timeStr}`;
};

export const MsgItem = memo(({ msg, ref }) => {
  if (!msg) return null;

  const {
    timestamp,
    type = "text",
    content = "",
    sentByMe,
    avatar_url,
    nikename,
  } = msg;

  const isRight = sentByMe === true || String(sentByMe).toLowerCase() === "true";

  const ContentComponent =
    type === "phone"
      ? PhoneContent
      : type === "image"
      ? ImageContent
      : TextContent;

  return (
    <Group
      ref={ref}
      justify={isRight ? "flex-end" : "flex-start"}
      align="flex-start"
      gap="xs"
      wrap="nowrap"
    >
      {!isRight && (
        <Box w={40} mt={4} style={{ flexShrink: 0 }}>
          <SafeAvatar url={avatar_url} size={40} radius={6} />
        </Box>
      )}

      <Stack gap={4} align={isRight ? "flex-end" : "flex-start"}>
        {!isRight && nikename && (
          <Text size="11px" c="dimmed" px={4}>
            {nikename}
          </Text>
        )}

        <Paper
          radius="lg"
          bg={isRight ? "blue.6" : "gray.1"}
          c={isRight ? "white" : "black"}
          shadow="xs"
          maw={300}
          style={{ overflow: "hidden", position: "relative" }}
          px={type === "image" ? 0 : "sm"}
          py={type === "image" ? 0 : 8}
        >
          <ContentComponent
            content={content}
            timestamp={timestamp}
            sentByMe={sentByMe}
          />
        </Paper>

        <Text size="10px" c="dimmed" px={4}>
          {formatChatTime(timestamp)}
        </Text>
      </Stack>

      {isRight && (
        <Box w={40} mt={4} style={{ flexShrink: 0 }}>
          <SafeAvatar url={avatar_url} size={40} radius={6} />
        </Box>
      )}
    </Group>
  );
});

MsgItem.displayName = "MsgItem";