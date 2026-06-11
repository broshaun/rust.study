import React from 'react';
import { Flex, Text } from '@mantine/core';

/**
 * 精简优化版的静态图标标签组件
 */
export function IconLabel({
  icon: IconComponent,
  label,
  iconColor = 'var(--mantine-color-gray-6)'
}) {
  return (
    <Flex
      direction="column"
      align="center"
      gap={4}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      {/* 1. 直接渲染图标，移除外部 Box 包裹层 */}
      <IconComponent size={22} color={iconColor} />

      {/* 2. 利用 Mantine 原生属性实现文本截断和居中，移除大量内联 CSS */}
      <Text size="xs" c="dimmed" ta="center" truncate w={72}>
        {label}
      </Text>
    </Flex>
  );
}