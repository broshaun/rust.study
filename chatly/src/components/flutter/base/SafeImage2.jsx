import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Box,
  Skeleton,
  Image,
  Center,
  Modal,
  UnstyledButton,
} from '@mantine/core';
import { useImage } from 'hooks/http';

export const SafeImage = React.memo(({
  url,
  previewUrl,
  width = '100%',
  height = 'auto',
  ratio,
  radius = 'sm',
  fit = 'cover',
  autoUpdate = false,
  version,
  allowPreview = true,
  alt = 'Image',
}) => {
  const [opened, setOpened] = useState(false);

  // =========================
  // URL 锁定机制（防抖闪）
  // =========================
  const lockedUrlRef = useRef(url || '');
  const lastVersionRef = useRef(version);

  if (lastVersionRef.current !== version) {
    lockedUrlRef.current = url || '';
    lastVersionRef.current = version;
  }

  const finalUrl = autoUpdate ? (url || '') : lockedUrlRef.current;
  const finalPreviewUrl = previewUrl || finalUrl;

  // =========================
  // 缩略图（始终加载）
  // =========================
  const {
    src: thumbSrc,
    loading: thumbLoading,
    success: thumbSuccess,
  } = useImage(finalUrl);

  // =========================
  // ❗预览图（只在打开时加载）
  // =========================
  const previewLoadUrl = opened ? finalPreviewUrl : '';

  const {
    src: previewSrc,
    loading: previewLoading,
    success: previewSuccess,
  } = useImage(previewLoadUrl);

  // =========================
  // ESC 关闭
  // =========================
  useEffect(() => {
    if (!opened) return;

    const handler = (e) => {
      if (e.key === 'Escape') setOpened(false);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [opened]);

  // =========================
  // 样式
  // =========================
  const containerStyle = useMemo(() => ({
    width,
    height: ratio ? 'auto' : height,
    aspectRatio: ratio,
    position: 'relative',
    overflow: 'hidden',
    borderRadius:
      typeof radius === 'number'
        ? radius
        : `var(--mantine-radius-${radius})`,
    backgroundColor: 'var(--mantine-color-gray-1)',
    cursor: allowPreview ? 'zoom-in' : 'default',
  }), [width, height, ratio, radius, allowPreview]);

  return (
    <>
      {/* =========================
          缩略图
      ========================= */}
      <Box
        component={allowPreview ? UnstyledButton : 'div'}
        onClick={() => allowPreview && setOpened(true)}
        style={containerStyle}
      >
        {thumbLoading && (
          <Skeleton animate style={{ position: 'absolute', inset: 0 }} />
        )}

        {thumbSuccess && (
          <Image
            src={thumbSrc}
            alt={alt}
            styles={{
              image: {
                width: '100%',
                height: '100%',
                objectFit: fit,
              },
            }}
          />
        )}

        {!thumbLoading && !thumbSuccess && (
          <Center style={{ position: 'absolute', inset: 0 }}>
            <span style={{ fontSize: 12, opacity: 0.6 }}>
              No Image
            </span>
          </Center>
        )}
      </Box>

      {/* =========================
          预览层（产品级）
      ========================= */}
      {allowPreview && (
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          size="auto"
          padding={0}
          centered
          withCloseButton={false}
          overlayProps={{
            blur: 6,
            opacity: 0.6,
          }}
          styles={{
            content: {
              background: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <Box
            onClick={() => setOpened(false)} // 点击背景关闭
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
            }}
          >
            {previewLoading && (
              <Skeleton
                animate
                style={{
                  width: 300,
                  height: 200,
                }}
              />
            )}

            {previewSuccess && (
              <Image
                src={previewSrc}
                alt="Preview"
                radius="md"
                fit="contain"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                }}
              />
            )}

            {!previewLoading && !previewSuccess && (
              <Center style={{ width: 240, height: 160 }}>
                <span style={{ fontSize: 12, opacity: 0.6 }}>
                  Load failed
                </span>
              </Center>
            )}
          </Box>
        </Modal>
      )}
    </>
  );
});

SafeImage.displayName = 'SafeImage';