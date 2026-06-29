import React, {
  useRef,
  useCallback,
  forwardRef,
  memo,
  useImperativeHandle,
} from 'react';

import { ActionIcon, Tooltip, Stack, Text } from '@mantine/core';
import { IconPhotoPlus } from '@tabler/icons-react';

export const ImgUp = memo(forwardRef(({
  onClick,
  maxSize = 5,
  acceptTypes = ['image/jpeg', 'image/png'],
  height = 56,
}, ref) => {

  const inputRef = useRef(null);

  // ===== 强制同步触发（关键）=====
  const openPicker = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;

    try {
      el.value = ''; // reset
      el.click();    // ⚠️ 必须同步执行
    } catch (e) {
      console.error('file picker blocked:', e);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    open: openPicker,
  }));

  const onChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    if (!acceptTypes.includes(file.type)) return;

    if (file.size > maxSize * 1024 * 1024) return;

    await onClick?.(file);
  }, [onClick, acceptTypes, maxSize]);

  return (
    <Stack>

      <input
        ref={inputRef}
        type="file"
        accept={acceptTypes.join(',')}
        onChange={onChange}
        style={{ display: 'none' }}
      />

      <Tooltip label="选择图片">
        <ActionIcon
          radius="xl"
          size={height + 6}
          onClick={openPicker}
          style={{
            minWidth: 48,
            minHeight: 48,
            touchAction: 'manipulation', // ⭐ mobile关键
          }}
        >
          <IconPhotoPlus size={22} />
        </ActionIcon>
      </Tooltip>

      <Text size="xs" c="dimmed">
        点击选择图片
      </Text>

    </Stack>
  );
}));

ImgUp.displayName = 'ImgUp';