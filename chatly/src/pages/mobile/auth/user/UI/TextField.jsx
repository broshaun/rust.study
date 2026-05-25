import React from "react";
import { TextInput, Text, Group, Box, rem, Paper } from "@mantine/core";

/**
 * TextField - 纯 Mantine 组件属性实现
 * 紧凑横向布局，无 'styles' 覆盖逻辑
 */
export const TextField = ({ 
  label, 
  hintText, 
  value, 
  onChanged, 
  maxWidth, 
  obscureText = false,
  disabled = false,
  error 
}) => {
  return (
    <Paper
      withBorder
      radius="var(--radius-main, md)"
      bg="var(--panel-bg, white)"
      // 使用 Paper 模拟容器，处理 maxWidth 和 禁用状态
      style={{ 
        maxWidth: typeof maxWidth === 'number' ? rem(maxWidth) : maxWidth,
        overflow: 'hidden',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'default',
        // 简单处理错误状态的边框颜色
        borderColor: error ? 'var(--mantine-color-red-filled)' : undefined 
      }}
    >
      <Group gap={0} wrap="nowrap" align="stretch">
        {label && (
          <Box 
            px="md" 
            py={0}
            bg="var(--mantine-color-gray-0)" // 标签背景色
            display="flex"
            style={{ 
              alignItems: 'center', 
              borderRight: '1px solid var(--mantine-color-gray-3)',
              flexShrink: 0
            }}
          >
            <Text size="xs" fw={600} c="dimmed">
              {label}
            </Text>
          </Box>
        )}
        
        <TextInput
          placeholder={hintText}
          value={value ?? ''}
          onChange={(e) => onChanged?.(e.currentTarget.value)}
          type={obscureText ? 'password' : 'text'}
          disabled={disabled}
          variant="unstyled" // 关键：去掉 TextInput 默认边框，使用 Paper 的边框
          size="sm"
          flex={1}
          px="sm"
          h={rem(40)} // 强制高度对齐
          autoComplete="off"
          // error 在这里只显示红字，边框已由 Paper 处理
          error={typeof error === 'string' ? error : !!error} 
        />
      </Group>
    </Paper>
  );
};