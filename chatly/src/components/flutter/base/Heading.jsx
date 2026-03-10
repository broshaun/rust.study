import React from 'react';
import { Text } from './Text';

/**
 * Heading - 语义化标题组件
 * @param {number} level - 标题等级 1-4 (1最大)
 * @param {boolean} tight - 是否紧凑行高
 */
export const Heading = ({ 
  children, 
  level = 2, 
  tight = false, 
  style, 
  ...props 
}) => {
  // 定义字阶系统
  const headingStyles = {
    1: { size: 24, weight: 800, height: 1.2 },
    2: { size: 20, weight: 700, height: 1.25 },
    3: { size: 17, weight: 600, height: 1.3 },
    4: { size: 15, weight: 600, height: 1.4 },
  };

  const current = headingStyles[level] || headingStyles[2];

  return (
    <Text
      size={current.size}
      weight={current.weight}
      height={tight ? 1.1 : current.height}
      style={{
        letterSpacing: level <= 2 ? '-0.02em' : 'normal', // 大标题增加紧凑感
        ...style
      }}
      {...props}
    >
      {children}
    </Text>
  );
};