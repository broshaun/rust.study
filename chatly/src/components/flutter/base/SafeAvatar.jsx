import React, { useMemo } from 'react';
import { Box, Skeleton, Image, Center } from '@mantine/core';
import { useImage } from "hooks/http"; // 请确保路径正确

/**
 * @component SafeAvatar
 * @description 针对虚拟列表优化的高性能头像组件。具备本地磁盘缓存与内存热缓存，消除滚动闪烁。
 * * @param {Object} props
 * @param {string} props.url - 必须。图片的下载地址。
 * @param {number} [props.size=40] - 头像尺寸(px)，宽高相等。默认 40。
 * @param {string|number} [props.radius="xl"] - 圆角大小。支持 Mantine 预设 (xs, sm, md, lg, xl) 或具体数字。
 * @param {string} [props.border="none"] - 边框样式，如 "1px solid #eee"。
 * @param {string} [props.shadow="sm"] - Mantine 阴影预设。
 * @param {boolean} [props.cover=true] - 是否比例裁剪。开启后保持比例铺满容器，边缘切除（默认）。
 * @param {boolean} [props.stretch=false] - 是否强制挤压。开启后图片拉伸变形以填满容器（不建议）。
 * @param {function} [props.onClick] - 点击回调函数。内置 100ms 缩放物理反馈。
 */
export const SafeAvatar = React.memo(({ 
  url, 
  size = 40, 
  radius = "xl", 
  border = "none", 
  shadow = "sm", 
  cover = true, 
  stretch = false, 
  onClick 
}) => {
  // 调用具备内存缓存能力的 Hook
  const { src, loading, error, success } = useImage(url);

  // 1. 优化：合并所有静态样式计算，减少 Render 负载
  const styles = useMemo(() => {
    // 确定填充模式：优先级 stretch > cover > contain
    const fit = stretch ? "fill" : (cover ? "cover" : "contain");
    
    return {
      container: {
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 100ms ease',
        backgroundColor: 'var(--mantine-color-gray-0)',
      },
      image: {
        width: '100%',
        height: '100%',
        display: 'block',
        objectFit: fit, // 核心：强制原生 CSS 控制防止变形
      }
    };
  }, [size, onClick, stretch, cover]);

  return (
    <Box
      onClick={onClick}
      style={(theme) => ({
        ...styles.container,
        borderRadius: theme.fn?.radius ? theme.fn.radius(radius) : (typeof radius === 'number' ? radius : '50%'),
        border: border,
        boxShadow: theme.shadows[shadow] || shadow,
        // 点击缩放反馈
        '&:active': { transform: onClick ? 'scale(0.92)' : 'none' },
      })}
    >
      {/* 状态1：仅在初次加载且内存无数据时显示骨架屏 */}
      {loading && !success && (
        <Skeleton style={{ position: 'absolute', inset: 0, zIndex: 2 }} animate />
      )}

      {/* 状态2：加载失败且无旧数据展示问号 */}
      {error && !success && (
        <Center style={{ width: '100%', height: '100%', color: 'var(--mantine-color-gray-4)', zIndex: 1 }}>
          <span style={{ fontSize: size * 0.35 }}>?</span>
        </Center>
      )}

      {/* 状态3：核心展示。由于移除了 Transition，图片准备好后会瞬间显示，无延迟感 */}
      {(success || src) && (
        <Image
          src={src}
          alt="Avatar"
          style={styles.image}
          // 穿透覆盖 Mantine Image 内部样式
          styles={{ image: styles.image }}
        />
      )}
    </Box>
  );
});

SafeAvatar.displayName = 'SafeAvatar';