import React, { useRef, useState, useEffect, memo, useMemo } from 'react';
import { Box, Skeleton, Image, Modal, UnstyledButton, Group, ActionIcon, Divider } from '@mantine/core';
import { IconZoomIn, IconMaximize, IconRotateClockwise, IconDownload, IconX } from '@tabler/icons-react';
import { useImage } from 'hooks/http';

export const SafeImage = memo(({
  url, previewUrl, width, height, radius = 'sm', fit = 'fill',
  autoUpdate = false, version, allowPreview = true, alt = 'Image', onDownload,
}) => {
  const [opened, setOpened] = useState(false);
  const [view, setView] = useState({ s: 1, x: 0, y: 0, r: 0 }); // s:缩放 x,y:位移 r:旋转
  const [isDrag, setIsDrag] = useState(false);
  const [ratio, setRatio] = useState(null); // 图片原始宽高比

  const dragStart = useRef({ x: 0, y: 0 });
  const lastVer = useRef(version);
  const lkdUrl = useRef(url || '');

  // 版本锁定逻辑
  if (!autoUpdate && lastVer.current !== version) {
    lkdUrl.current = url || '';
    lastVer.current = version;
  }

  const finalUrl = autoUpdate ? (url || '') : lkdUrl.current;
  const { src, loading, success } = useImage(finalUrl);
  const { src: pSrc, success: pSucc } = useImage(opened ? (previewUrl || finalUrl) : '');

  // 关闭预览时重置视图
  useEffect(() => { if (!opened) setView({ s: 1, x: 0, y: 0, r: 0 }); }, [opened]);

  // 核心逻辑：智能推算尺寸
  const { w, h } = useMemo(() => {
    if (width !== undefined && height !== undefined) return { w: width, h: height };
    const getNum = (val) => parseFloat(val) || 0; 
    if (width !== undefined) return { w: width, h: ratio ? getNum(width) / ratio : 50 };
    if (height !== undefined) return { w: ratio ? getNum(height) * ratio : 50, h: height };
    return { w: '100%', h: 'auto' };
  }, [width, height, ratio]);

  return (
    <>
      <Box
        component={allowPreview ? UnstyledButton : 'div'}
        onClick={() => allowPreview && setOpened(true)}
        style={{
          width: w, height: h, position: 'relative', overflow: 'hidden', lineHeight: 0,
          borderRadius: typeof radius === 'number' ? radius : `var(--mantine-radius-${radius})`,
          backgroundColor: 'transparent', display: 'inline-block', verticalAlign: 'middle',
          cursor: allowPreview ? 'zoom-in' : 'default'
        }}
      >
        {/* 加载中或还未获取到比例时，展示骨架屏 */}
        {(loading || !ratio) && <Skeleton animate style={{ position: 'absolute', inset: 0, zIndex: 1 }} />}
        
        {success && (
          <Image 
            src={src} 
            alt={alt}
            onLoad={(e) => {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              if (naturalWidth && naturalHeight) setRatio(naturalWidth / naturalHeight);
            }}
            styles={{
              root: { width: '100%', height: '100%' },
              image: { objectFit: fit, width: '100%', height: '100%', borderRadius: 'inherit' }
            }}
          />
        )}
      </Box>

      {allowPreview && (
        <Modal
          opened={opened} onClose={() => setOpened(false)} size="100%" padding={0} centered withCloseButton={false}
          overlayProps={{ blur: 15, opacity: 0.9, color: '#000' }}
          styles={{ content: { background: 'transparent', height: '100vh', boxShadow: 'none' }, body: { height: '100%', display: 'flex', flexDirection: 'column', padding: 0 } }}
        >
          <Box
            onWheel={e => setView(v => ({ ...v, s: Math.min(Math.max(v.s + (e.deltaY > 0 ? -0.2 : 0.2), 0.8), 5) }))}
            onMouseDown={e => view.s > 1 && (setIsDrag(true), dragStart.current = { x: e.clientX - view.x, y: e.clientY - view.y })}
            onMouseMove={e => isDrag && setView(v => ({ ...v, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }))}
            onMouseUp={() => setIsDrag(false)} onMouseLeave={() => setIsDrag(false)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: isDrag ? 'grabbing' : view.s > 1 ? 'grab' : 'default' }}
          >
            {pSucc && (
              <Image
                src={pSrc} alt={alt} fit="contain"
                style={{
                  transform: `translate(${view.x}px, ${view.y}px) scale(${view.s}) rotate(${view.r}deg)`,
                  transition: isDrag ? 'none' : 'transform 0.2s cubic-bezier(0, 0, 0.2, 1)',
                  userSelect: 'none', maxHeight: '90vh', maxWidth: '95vw', pointerEvents: 'none'
                }}
              />
            )}
          </Box>

          {/* 底部功能栏 */}
          <Box py="md" style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <Group gap={8} px={12} py={4} wrap="nowrap" style={{ backgroundColor: 'rgba(40,40,40,0.8)', borderRadius: 8, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ActionIcon variant="subtle" color="gray.2" size="md" onClick={() => setView(v => ({ ...v, s: Math.min(v.s + 0.5, 5) }))}><IconZoomIn size={18} /></ActionIcon>
              <ActionIcon variant="subtle" color="gray.2" size="md" onClick={() => setView({ s: 1, x: 0, y: 0, r: 0 })}><IconMaximize size={18} /></ActionIcon>
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