import React, { useMemo, useRef } from 'react';
import { Box, Skeleton, Image, Center } from '@mantine/core';
import { useImage } from 'hooks/http';

/**
 * SafeAvatar
 *
 * 使用规则：
 * 1. 默认不自动更新头像（autoUpdate = false）
 * 2. autoUpdate = true 时，跟随 url 自动更新
 * 3. version 变化时，重新采纳当前 url
 *
 * props:
 * - url: 图片地址
 * - size: 尺寸，默认 40
 * - radius: 圆角，支持 number / xs / sm / md / lg / xl / circle / square
 * - cover: 是否裁剪铺满，默认 true
 * - stretch: 是否强制拉伸，默认 false
 * - onClick: 点击事件
 * - autoUpdate: 是否自动响应 url 变化，默认 false
 * - version: 手动控制版本；变化时重新采纳当前 url
 */
export const SafeAvatar = React.memo(({
  url,
  size = 40,
  radius = 'circle',
  cover = true,
  stretch = false,
  onClick,
  autoUpdate = false,
  version,
}) => {
  // 锁定使用中的 url
  const lockedUrlRef = useRef(url || '');
  const lastVersionRef = useRef(version);

  // version 变化时，重新采纳当前 url
  if (lastVersionRef.current !== version) {
    lockedUrlRef.current = url || '';
    lastVersionRef.current = version;
  }

  // autoUpdate=true 时，始终跟随外部 url
  // autoUpdate=false 时，使用锁定的 url
  const finalUrl = autoUpdate ? (url || '') : lockedUrlRef.current;

  const { src, loading, error, success } = useImage(finalUrl);

  const resolvedRadius = useMemo(() => {
    if (typeof radius === 'number') return radius;
    if (radius === 'circle' || radius === '50%') return '50%';
    if (radius === 'square' || radius === 0) return 0;

    const radiusMap = {
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
    };

    return radiusMap[radius] ?? radius;
  }, [radius]);

  const fit = useMemo(() => {
    if (stretch) return 'fill';
    return cover ? 'cover' : 'contain';
  }, [stretch, cover]);

  const containerStyle = useMemo(() => ({
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: resolvedRadius,
    cursor: onClick ? 'pointer' : 'default',
    boxSizing: 'border-box',
    flexShrink: 0,
    background: '#f5f5f5',
  }), [size, resolvedRadius, onClick]);

  const imageStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: fit,
  }), [fit]);

  return (
    <Box onClick={onClick} style={containerStyle}>
      {/* loading 中：只显示占位，不渲染最终图片 */}
      {loading && (
        <Skeleton
          style={{
            position: 'absolute',
            inset: 0,
          }}
          animate
        />
      )}

      {/* success 为 true 时，才渲染图片 */}
      {!loading && success && (
        <Image
          src={src}
          alt="Avatar"
          draggable={false}
          style={imageStyle}
          styles={{ image: imageStyle }}
        />
      )}

      {/* 非 loading 且未 success 时，显示简单兜底 */}
      {!loading && !success && (
        <Center
          style={{
            width: '100%',
            height: '100%',
            background: '#f5f5f5',
          }}
        >
          <span
            style={{
              fontSize: Math.max(12, size * 0.32),
              lineHeight: 1,
              color: '#999',
              userSelect: 'none',
            }}
          >
            ?
          </span>
        </Center>
      )}
    </Box>
  );
});

SafeAvatar.displayName = 'SafeAvatar';