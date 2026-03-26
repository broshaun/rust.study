import React, { useRef, useState, useEffect, memo } from 'react';
import { Box, Skeleton, Image, Modal, UnstyledButton, Group, ActionIcon, Divider } from '@mantine/core';
import { IconZoomIn, IconMaximize, IconRotateClockwise, IconDownload, IconX } from '@tabler/icons-react';
import { useImage } from 'hooks/http';

export const SafeImage = memo(({
  url, previewUrl, width = '100%', height = 'auto', ratio, radius = 'sm', fit = 'cover',
  autoUpdate = false, version, allowPreview = true, alt = 'Image', onDownload,
}) => {
  const [opened, setOpened] = useState(false);
  const [view, setView] = useState({ s: 1, x: 0, y: 0, r: 0 }); // s: scale, r: rotation
  const [isDrag, setIsDrag] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const lastVer = useRef(version);
  const lkdUrl = useRef(url || '');

  // 版本锁定逻辑精简
  if (!autoUpdate && lastVer.current !== version) {
    lkdUrl.current = url || '';
    lastVer.current = version;
  }

  const finalUrl = autoUpdate ? (url || '') : lkdUrl.current;
  const { src: tSrc, loading: tLoad, success: tSucc } = useImage(finalUrl);
  const { src: pSrc, success: pSucc } = useImage(opened ? (previewUrl || finalUrl) : '');

  const reset = () => setView({ s: 1, x: 0, y: 0, r: 0 });
  useEffect(() => { if (!opened) reset(); }, [opened]);

  const handleMove = (e) => {
    if (!isDrag) return;
    setView(v => ({ ...v, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }));
  };

  // 彻底移除边框的通用样式
  const noBorder = { border: 'none', outline: 'none', boxShadow: 'none' };

  return (
    <>
      <Box
        component={allowPreview ? UnstyledButton : 'div'}
        onClick={() => allowPreview && setOpened(true)}
        style={{
          width, height: ratio ? 'auto' : height, aspectRatio: ratio,
          position: 'relative', overflow: 'hidden', ...noBorder,
          borderRadius: typeof radius === 'number' ? radius : `var(--mantine-radius-${radius})`,
          backgroundColor: 'var(--mantine-color-gray-1)', cursor: allowPreview ? 'zoom-in' : 'default',
        }}
      >
        {tLoad && <Skeleton animate style={{ position: 'absolute', inset: 0, ...noBorder }} />}
        {tSucc && <Image src={tSrc} alt={alt} styles={{ image: { width: '100%', height: '100%', objectFit: fit, ...noBorder } }} />}
      </Box>

      {allowPreview && (
        <Modal
          opened={opened} onClose={() => setOpened(false)} size="100%" padding={0} centered withCloseButton={false}
          overlayProps={{ blur: 15, opacity: 0.9, color: '#000' }}
          styles={{ 
            content: { background: 'transparent', height: '100vh', ...noBorder },
            body: { height: '100%', display: 'flex', flexDirection: 'column', padding: 0 } 
          }}
        >
          <Box
            onWheel={e => setView(v => ({ ...v, s: Math.min(Math.max(v.s + (e.deltaY > 0 ? -0.2 : 0.2), 0.8), 5) }))}
            onMouseDown={e => view.s > 1 && (setIsDrag(true), dragStart.current = { x: e.clientX - view.x, y: e.clientY - view.y })}
            onMouseMove={handleMove}
            onMouseUp={() => setIsDrag(false)}
            onMouseLeave={() => setIsDrag(false)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: isDrag ? 'grabbing' : view.s > 1 ? 'grab' : 'default' }}
          >
            {pSucc && (
              <Image
                src={pSrc} alt={alt}
                style={{
                  transform: `translate(${view.x}px, ${view.y}px) scale(${view.s}) rotate(${view.r}deg)`,
                  transition: isDrag ? 'none' : 'transform 0.2s cubic-bezier(0, 0, 0.2, 1)',
                  userSelect: 'none', maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', ...noBorder, pointerEvents: 'none'
                }}
              />
            )}
          </Box>

          {/* 🌟 极致紧凑单行工具栏 */}
          <Box py="md" style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <Group gap={8} px={12} py={4} wrap="nowrap" style={{ backgroundColor: 'rgba(40,40,40,0.8)', borderRadius: 8, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ActionIcon variant="subtle" color="gray.2" size="md" onClick={() => setView(v => ({ ...v, s: Math.min(v.s + 0.5, 5) }))}><IconZoomIn size={18} /></ActionIcon>
              <ActionIcon variant="subtle" color="gray.2" size="md" onClick={reset}><IconMaximize size={18} /></ActionIcon>
              <ActionIcon variant="subtle" color="gray.2" size="md" onClick={() => setView(v => ({ ...v, r: v.r + 90 }))}><IconRotateClockwise size={18} /></ActionIcon>
              <Divider orientation="vertical" color="rgba(255,255,255,0.15)" h={14} />
              <ActionIcon variant="subtle" color="blue.4" size="md" onClick={() => onDownload?.(pSrc || finalUrl)}><IconDownload size={18} /></ActionIcon>
              <ActionIcon variant="subtle" color="red.6" size="md" onClick={() => setOpened(false)}><IconX size={18} /></ActionIcon>
            </Group>
          </Box>
        </Modal>
      )}
    </>
  );
});

SafeImage.displayName = 'SafeImage';