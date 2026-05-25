import React, {
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  memo,
} from 'react';
import { Stack, Group, ActionIcon, Image, Paper, Text, Tooltip } from '@mantine/core';
import { IconPhotoPlus, IconX, IconSend } from '@tabler/icons-react';

export const ImgUp = memo(({
  ref,
  onClick,
  onClear,
  maxSize = 5,
  maxCount = 9,
  maxWidth = 240,
  acceptTypes = ['image/jpeg', 'image/png'],
  height = 48,
  multiple = true,
}) => {
  const inputRef = useRef(null);
  const [errorText, setErrorText] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [previews, setPreviews] = useState([]); 

  const clear = useCallback(() => {
    if (inputRef.current) inputRef.current.value = '';
    setPreviews(prev => {
      prev.forEach(p => URL.revokeObjectURL(p.url));
      return [];
    });
    setErrorText('');
    onClear?.();
  }, [onClear]);

  useImperativeHandle(ref, () => ({
    clear,
    clearError: () => setErrorText(''),
    open: () => {
      setErrorText('');
      inputRef.current?.click();
    },
  }), [clear]);

  useEffect(() => {
    return () => previews.forEach(p => URL.revokeObjectURL(p.url));
  }, [previews]);

  const onChange = useCallback((e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    if (inputRef.current) inputRef.current.value = '';

    let err = '';
    const newPreviews = files.filter(f => {
      if (!acceptTypes.includes(f.type)) { err = `格式不支持: ${f.name}`; return false; }
      if (f.size > maxSize * 1024 * 1024) { err = `超出大小: ${f.name}`; return false; }
      return true;
    }).map(file => ({ url: URL.createObjectURL(file), file }));

    if (err) setErrorText(err); else setErrorText('');

    if (newPreviews.length > 0) {
      setPreviews(prev => {
        const total = [...prev, ...newPreviews];
        if (total.length > maxCount) {
          setErrorText(`最多只能选择 ${maxCount} 张图片`);
          total.slice(maxCount).forEach(p => URL.revokeObjectURL(p.url));
          return total.slice(0, maxCount);
        }
        return total;
      });
    }
  }, [acceptTypes, maxSize, maxCount]);

  const removeSingleImage = useCallback((url) => {
    URL.revokeObjectURL(url);
    setPreviews(prev => {
      const next = prev.filter(p => p.url !== url);
      if (!next.length) onClear?.();
      return next;
    });
  }, [onClear]);

  const handleConfirm = useCallback(async () => {
    if (!previews.length) return;
    setIsPending(true);
    try {
      await onClick?.(previews.map(p => p.file));
      clear(); 
    } catch {
      setErrorText('操作失败，请重试');
    } finally {
      setIsPending(false);
    }
  }, [previews, onClick, clear]);

  const hasImgs = previews.length > 0;
  const canAdd = previews.length < maxCount;
  const uiSize = height + 4;

  return (
    <Stack gap="xs" align="flex-start">
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={acceptTypes.join(',')}
        onChange={onChange}
      />

      {previews.map(p => (
        <Group key={p.url} gap="sm" wrap="nowrap">
          <Paper radius="sm" withBorder p={2} display="flex">
            <Image src={p.url} h={height} w="auto" maw={maxWidth} fit="contain" radius="sm" />
          </Paper>
          <Tooltip label="移除图片" position="right">
            <ActionIcon color="red" variant="light" radius="sm" size={uiSize} disabled={isPending} onClick={() => removeSingleImage(p.url)}>
              <IconX size={height * 0.45} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ))}

      {errorText && <Text size="xs" c="red" fw={500}>{errorText}</Text>}

      <Group gap="sm">
        {canAdd && (
          <Tooltip label={hasImgs ? "继续添加图片" : "选择图片"} position="bottom">
            <ActionIcon variant="light" radius="sm" size={uiSize} disabled={isPending} onClick={() => inputRef.current?.click()}>
              <IconPhotoPlus size={height * 0.55} />
            </ActionIcon>
          </Tooltip>
        )}

        {hasImgs && (
          <Tooltip label="确认发送" position="bottom">
            <ActionIcon variant="filled" radius="sm" size={uiSize} loading={isPending} onClick={handleConfirm}>
              <IconSend size={height * 0.5} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Stack>
  );
});

ImgUp.displayName = 'ImgUp';