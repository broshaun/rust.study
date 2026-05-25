import React, { memo } from "react";
import { Box, Text, UnstyledButton, useMantineColorScheme } from "@mantine/core";

const cp = (...codes) => String.fromCodePoint(...codes);

const EMOJI_GROUPS = [
  ["常用", [
    [0x1F600], [0x1F604], [0x1F60A], [0x1F609], [0x1F44D],
    [0x1F44C], [0x1F64F], [0x1F44F], [0x1F64C], [0x2728],
    [0x1F525], [0x1F4AF], [0x1F339], [0x1F91D],
  ]],
  ["商务", [
    [0x1F4BC], [0x1F4CA], [0x1F4C8], [0x1F4C9], [0x1F4D1],
    [0x1F4CB], [0x1F4C5], [0x1F5D3, 0xFE0F], [0x1F4DD], [0x1F4CC],
    [0x1F4CE], [0x1F4A1], [0x1F3E2], [0x1F91D],
  ]],
  ["贸易", [
    [0x1F4E6], [0x1F6A2], [0x1F69A], [0x2708, 0xFE0F], [0x1F30D],
    [0x1F4B0], [0x1F4B5], [0x1F4B6], [0x1F9FE], [0x1F3ED],
    [0x2693], [0x1F4E4], [0x1F4E5], [0x1F6C3],
  ]],
  ["医疗", [
    [0x1F3E5], [0x1F489], [0x1F9EC], [0x1F9EA], [0x1F321, 0xFE0F],
    [0x1FA7A], [0x1FA79], [0x1F48A], [0x1F4A7], [0x1F52C],
    [0x1F6E1, 0xFE0F], [0x1FA78], [0x1F691], [0x1F468, 0x200D, 0x2695, 0xFE0F],
  ]],
  ["沟通", [
    [0x1F4AC], [0x2709, 0xFE0F], [0x1F4E9], [0x1F4E8], [0x1F4DE],
    [0x260E, 0xFE0F], [0x1F4E2], [0x1F4E3], [0x1F514], [0x1F4CD],
    [0x2757], [0x2753], [0x2705], [0x23F3],
  ]],
  ["情绪", [
    [0x1F603], [0x1F601], [0x1F60E], [0x1F914], [0x1F62E],
    [0x1F60C], [0x1F973], [0x1F680], [0x1F389], [0x1F388],
    [0x1F917], [0x1F607], [0x1F642], [0x1F643],
  ]],
];

export const EmojiList = memo(function EmojiList({ onSelect }) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Box w="100%" p="xs">
      {EMOJI_GROUPS.map(([label, codes], groupIndex) => (
        <Box key={`emoji-group-${groupIndex}`} mb="md">
          <Text size="xs" fw={700} c={isDark ? "gray.5" : "gray.7"} mb={8}>
            {label}
          </Text>

          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))",
              gap: 4,
            }}
          >
            {codes.map((codePoints, index) => {
              const emoji = cp(...codePoints);

              return (
                <UnstyledButton
                  key={`emoji-${groupIndex}-${index}`}
                  aria-label={`select emoji ${emoji}`}
                  onClick={() => onSelect?.(emoji)}
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    minWidth: 36,
                    borderRadius: 8,
                    fontSize: 20,
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.15s ease, background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.15)";
                    e.currentTarget.style.backgroundColor = isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {emoji}
                </UnstyledButton>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
});