import React from '.store/react@18.3.1/node_modules/react';
import styles from './Chat.module.css';

// 左面板组件
const ChatLeft = ({
  size = '25%', // 默认宽度25%
  style,
  children,
  className
}) => {
  // 处理size样式：数字转px，字符串直接使用
  const panelStyle = {
    flex: typeof size === 'string' && size.match(/^\d+$/) ? `0 0 ${size}px` : 'auto',
    width: typeof size === 'number' ? `${size}px` : size,
    ...style
  };

  return (
    <div
      className={`${styles.chatLeft} ${className || ''}`}
      style={panelStyle}
    >
      {children}
    </div>
  );
};

// 右面板组件
const ChatRight = ({
  size = '75%', // 默认宽度75%
  style,
  children,
  className
}) => {
  const panelStyle = {
    flex: typeof size === 'string' && size.match(/^\d+$/) ? `0 0 ${size}px` : 'auto',
    width: typeof size === 'number' ? `${size}px` : size,
    ...style
  };

  return (
    <div
      className={`${styles.chatRight} ${className || ''}`}
      style={panelStyle}
    >
      {children}
    </div>
  );
};

// 核心Chat组件
const Chat = ({
  height = '100%',
  style,
  children,
  className,
  dividerWidth = 1,
  dividerColor = '#e5e6eb'
}) => {
  // 整体容器样式
  const containerStyle = {
    height: typeof height === 'number' ? `${height}px` : height,
    '--divider-width': `${dividerWidth}px`,
    '--divider-color': dividerColor,
    ...style
  };

  return (
    <div
      className={`${styles.chatContainer} ${className || ''}`}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

// 挂载Left/Right组件到Chat上
Chat.Left = ChatLeft;
Chat.Right = ChatRight;

export default Chat;