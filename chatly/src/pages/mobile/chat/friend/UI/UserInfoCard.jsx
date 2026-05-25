import React, { useState } from "react";
import { Card, Group, Text, Button, Box } from "@mantine/core";

// --- 主组件 ---
export const UserInfoCard = ({
  title = '用户信息', // 替换为《用户信息》
  onAction,
  actionText = '添加好友', // 默认改为《添加好友》
  refuseText,
  loading = false,
  background = '',
  children
}) => {
  const [handled, setHandled] = useState(false);

  const handleExecute = async (type) => {
    if (loading || handled) return;

    try {
      if (onAction) {
        await onAction(type);
      }
      setHandled(true);
    } catch (err) {
      console.error(`${type}操作失败:`, err);
    }
  };

  // 处理自定义背景逻辑
  const isUrl = background.includes('http') || background.includes('url(');
  const cardStyle = background
    ? {
        backgroundImage: isUrl ? `url(${background.replace(/url\(['"]?|['"]?\)/g, '')})` : undefined,
        backgroundColor: !isUrl ? background : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: isUrl ? '#fff' : undefined,
      }
    : {};

  // 文字阴影（如果是背景图模式）
  const textShadowStyle = isUrl ? { textShadow: '0 1px 4px rgba(0,0,0,0.8)' } : {};

  const showAccept = !!actionText;
  const showRefuse = !!refuseText;

  return (
    <Card 
      shadow="sm" 
      padding="sm" // 紧凑内边距
      radius="md" 
      withBorder={!background}
      style={cardStyle}
    >
      {/* 头部：标题与操作按钮 */}
      <Card.Section 
        withBorder 
        inheritPadding 
        py="xs" // 紧凑的上下边距
        style={{ borderColor: 'rgba(0,0,0,0.05)' }}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fw={600} size="sm" style={textShadowStyle}>
            {title}
          </Text>

          {(showAccept || showRefuse) && (
            <Group gap={6} wrap="nowrap">
              {showRefuse && (
                <Button
                  color="red"
                  size="xs" // 紧凑按钮尺寸
                  variant={handled ? "filled" : "light"}
                  disabled={loading || handled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecute('refuse');
                  }}
                >
                  {handled ? '已处理' : refuseText}
                </Button>
              )}

              {showAccept && (
                <Button
                  color="blue"
                  size="xs" // 紧凑按钮尺寸
                  loading={loading && !handled}
                  disabled={handled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecute('accept');
                  }}
                >
                  {handled ? '已处理' : actionText}
                </Button>
              )}
            </Group>
          )}
        </Group>
      </Card.Section>

      {/* 内容区域 */}
      <Group gap="sm" mt="sm" align="center" wrap="nowrap">
        {children}
      </Group>
    </Card>
  );
};


// --- 子组件：头像容器 ---
UserInfoCard.Avatar = ({ children }) => (
  <Box
    style={{
      width: 48,  // 从 64px 缩小到 48px，更显紧凑
      height: 48,
      borderRadius: '50%',
      overflow: 'hidden',
      border: '2px solid #fff',
      background: '#f5f5f5',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {/* 自动为子级 img 标签注入样式 */}
    {React.isValidElement(children) && children.type === 'img'
      ? React.cloneElement(children, { style: { width: '100%', height: '100%', objectFit: 'cover' } })
      : children}
  </Box>
);




// --- 子组件：信息文本 ---
UserInfoCard.Info = ({ children }) => {
  const isObj = typeof children === 'object' && children !== null;
  const name = isObj
    ? (children?.remark || children?.nikename || children?.email || '未知')
    : children;

  // 提取背景图阴影逻辑的上下文（通常由父级继承，这里通过 textShadow 保证清晰度）
  return (
    <Box style={{ flex: 1, minWidth: 0 }}>
      {/* 名字行 */}
      <Group gap={4} size="xs" wrap="nowrap">
        <Text size="xs" c="dimmed" style={{ color: 'inherit', opacity: 0.8 }}>名称：</Text>
        <Text size="xs" fw={500} truncate style={{ color: 'inherit' }}>{name}</Text>
      </Group>

      {/* 邮箱行 */}
      {isObj && children?.email && (
        <Group gap={4} size="xs" mt={2} wrap="nowrap">
          <Text size="xs" c="dimmed" style={{ color: 'inherit', opacity: 0.8 }}>邮箱：</Text>
          <Text size="xs" fw={500} truncate style={{ color: 'inherit' }}>{children.email}</Text>
        </Group>
      )}
    </Box>
  );
};