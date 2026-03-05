import React from 'react';

/**
 * Flutter 风格 SizedBox 组件
 * 用于精确控制组件间的间距或固定容器尺寸
 */
export const SizedBox = ({ width, height, child, children }) => {
  const content = child || children;
  
  const style = {
    // 自动处理数字（转为px）或字符串
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    // 防止在 Flex 布局中被压缩
    flexShrink: 0, 
    display: content ? 'block' : 'inline-block'
  };

  return (
    <div style={style}>
      {content}
    </div>
  );
};