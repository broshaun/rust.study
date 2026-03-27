import React, { useEffect, useState, memo } from "react";
import * as TablerIcons from "@tabler/icons-react";
import { 
  Group, 
  Text, 
  TextInput, 
  UnstyledButton, 
  Box, 
  Button, 
  ActionIcon,
  rem 
} from '@mantine/core';

/**
 * InfoTile - Mantine 商务版
 * 适配自动主题、70px固定标签宽、Slate风格
 */
export const InfoTile = memo(({ icon, label, value, onConfirm, style }) => {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value || "");
  const editable = typeof onConfirm === "function";

  useEffect(() => setTemp(value || ""), [value]);

  // 动态获取图标
  const IconComponent = TablerIcons[icon?.startsWith("Icon") ? icon : `Icon${icon?.charAt(0).toUpperCase()}${icon?.slice(1)}`] || TablerIcons.IconInfoCircle;

  const handleConfirm = () => {
    onConfirm?.(temp);
    setEditing(false);
  };

  return (
    <Box 
      py={4} 
      style={{ 
        borderBottom: `1px solid var(--mantine-color-default-border)`,
        position: 'relative',
        minHeight: rem(36),
        ...style 
      }}
    >
      {!editing ? (
        <UnstyledButton
          onClick={() => editable && setEditing(true)}
          w="100%"
          style={{ cursor: editable ? "pointer" : "default" }}
        >
          <Group gap={8} wrap="nowrap" align="center">
            {/* 左侧：固定 70px 标签区 */}
            <Group gap={4} w={70} wrap="nowrap" style={{ flexShrink: 0 }}>
              <IconComponent 
                size={14} 
                stroke={2.2} 
                color="var(--mantine-color-dimmed)" 
              />
              <Text 
                size="xs" 
                c="dimmed" 
                fw={500} 
                lh={1}
              >
                {label}
              </Text>
            </Group>

            {/* 右侧：Value 内容区 */}
            <Text 
              size="sm" 
              fw={600} 
              lh={1} 
              truncate="end" 
              style={{ flex: 1 }}
            >
              {value || "-"}
            </Text>

            {/* 编辑箭头指示 */}
            {editable && (
              <TablerIcons.IconChevronRight 
                size={12} 
                style={{ opacity: 0.3, color: 'var(--mantine-color-dimmed)' }} 
              />
            )}
          </Group>
        </UnstyledButton>
      ) : (
        /* 编辑状态：绝对定位覆盖 */
        <Group 
          gap={4} 
          wrap="nowrap"
          p={0}
          style={{ 
            position: 'absolute', 
            inset: 0, 
            zIndex: 5, 
            backgroundColor: 'var(--mantine-color-body)' 
          }}
        >
          <TextInput
            autoFocus
            size="xs"
            variant="filled"
            value={temp}
            onChange={(e) => setTemp(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            onBlur={() => setTimeout(() => setEditing(false), 200)}
            style={{ flex: 1 }}
            styles={{ input: { height: rem(28), minHeight: rem(28) } }}
          />
          <Button
            size="compact-xs"
            color="slate" // 如果你定义了 slate 主题，或者用 blue/dark
            bg="#334155"  // 保持你要求的专业石墨蓝
            onClick={handleConfirm}
            onMouseDown={(e) => e.preventDefault()}
          >
            确认
          </Button>
        </Group>
      )}
    </Box>
  );
});

export default InfoTile;