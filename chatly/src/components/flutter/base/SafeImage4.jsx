import React, { useRef, useState, useEffect, memo } from 'react';
import { Box, Skeleton, Image, Modal, UnstyledButton, Group, ActionIcon, Divider } from '@mantine/core';
import { IconZoomIn, IconMaximize, IconRotateClockwise, IconDownload, IconX } from '@tabler/icons-react';
import { useImage } from 'hooks/http';

export const SafeImage = memo(({
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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const lockedUrlRef = useRef(url || '');
  const lastVersionRef = useRef(version);
  if (lastVersionRef.current !== version) {
    lockedUrlRef.current = url || '';
    lastVersionRef.current = version;
  }
  const finalUrl = autoUpdate ? (url || '') : lockedUrlRef.current;
  const finalPreviewUrl = previewUrl || finalUrl;

  const { src: thumbSrc, loading: thumbLoading, success: thumbSuccess } = useImage(finalUrl);
  const previewLoadUrl = opened ? finalPreviewUrl : '';
  const { src: previewSrc, success: previewSuccess } = useImage(previewLoadUrl);

  const resetToInitial = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotate = () => setRotation(r => r + 90);

  useEffect(() => {
    if (!opened) {
      resetToInitial();
      setRotation(0);
    }
  }, [opened]);

  // 🌟 滚轮缩放逻辑：上限调整为 5 倍
  const handleWheel = (e) => {
    if (!opened) return;
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.8), 5));
  };

  const handleDownload = async () => {
    try {
      const resp = await fetch(finalPreviewUrl);
      const blob = await resp.blob();
      const bUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = bUrl;
      a.download = `IMG_${Date.now()}.jpg`;
      a.click();
      window.URL.revokeObjectURL(bUrl);
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <Box
        component={allowPreview ? UnstyledButton : 'div'}
        onClick={() => allowPreview && setOpened(true)}
        style={{
          width, height: ratio ? 'auto' : height, aspectRatio: ratio,
          position: 'relative', overflow: 'hidden', border: 'none',
          borderRadius: typeof radius === 'number' ? radius : `var(--mantine-radius-${radius})`,
          backgroundColor: 'var(--mantine-color-gray-1)', cursor: allowPreview ? 'zoom-in' : 'default',
        }}
      >
        {thumbLoading && <Skeleton animate style={{ position: 'absolute', inset: 0 }} />}
        {thumbSuccess && <Image src={thumbSrc} alt={alt} styles={{ image: { width: '100%', height: '100%', objectFit: fit, border: 'none' } }} />}
      </Box>

      {allowPreview && (
        <Modal
          opened={opened} onClose={() => setOpened(false)} size="100%" padding={0} centered withCloseButton={false}
          overlayProps={{ blur: 15, opacity: 0.9, color: '#000' }}
          styles={{ 
            content: { background: 'transparent', boxShadow: 'none', height: '100vh' },
            inner: { overflow: 'hidden', padding: 0 },
            body: { height: '100%', display: 'flex', flexDirection: 'column' }
          }}
        >
          {/* 视口区 */}
          <Box
            onWheel={handleWheel}
            onMouseDown={(e) => scale > 1 && (setIsDragging(true), dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y })}
            onMouseMove={(e) => isDragging && setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            style={{ 
              flex: 1, 
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              overflow: 'hidden', cursor: isDragging ? 'grabbing' : (scale > 1 ? 'grab' : 'default'),
            }}
          >
            {previewSuccess && (
              <Image
                src={previewSrc}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  // 🌟 针对 5 倍放大的平滑度微调
                  transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0, 0, 0.2, 1)',
                  userSelect: 'none', 
                  maxHeight: '95vh', 
                  maxWidth: '95vw', 
                  objectFit: 'contain',
                  border: 'none',
                }}
              />
            )}
          </Box>

          {/* 底部紧凑操作栏 */}
          <Box py="lg" style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <Group 
              gap={14} 
              wrap="nowrap" 
              style={{ 
                backgroundColor: 'rgba(45, 45, 45, 0.8)', 
                padding: '8px 16px',
                borderRadius: '10px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* 放大 (上限 5x) */}
              <ActionIcon variant="subtle" color="gray.2" size="lg" onClick={() => setScale(s => Math.min(s + 0.5, 5))}>
                <IconZoomIn size={22} stroke={1.5} />
              </ActionIcon>
              
              {/* 复原 */}
              <ActionIcon variant="subtle" color="gray.2" size="lg" onClick={resetToInitial}>
                <IconMaximize size={22} stroke={1.5} />
              </ActionIcon>

              {/* 旋转 */}
              <ActionIcon variant="subtle" color="gray.2" size="lg" onClick={handleRotate}>
                <IconRotateClockwise size={22} stroke={1.5} />
              </ActionIcon>

              <Divider orientation="vertical" color="rgba(255,255,255,0.15)" h={18} />

              <ActionIcon variant="subtle" color="blue.4" size="lg" onClick={handleDownload}>
                <IconDownload size={22} stroke={1.5} />
              </ActionIcon>

              <ActionIcon variant="subtle" color="red.6" size="lg" onClick={() => setOpened(false)}>
                <IconX size={22} stroke={1.5} />
              </ActionIcon>
            </Group>
          </Box>
        </Modal>
      )}
    </>
  );
});

SafeImage.displayName = 'SafeImage';