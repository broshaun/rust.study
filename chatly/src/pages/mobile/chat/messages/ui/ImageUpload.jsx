import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  memo,
} from 'react';

import {
  Group,
  ActionIcon,
  Image,
  Paper,
  Text,
  Tooltip,
} from '@mantine/core';

import {
  IconPhotoPlus,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

export const ImgUp = memo(({
  ref,
  onConfirm,
  maxSize = 5,
  acceptTypes = ['image/jpeg', 'image/png'],
  previewWidth = 48,
  onError,
}) => {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errorText, setErrorText] = useState('');

  useImperativeHandle(ref, () => ({
    file,
    clear,
  }));

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const clear = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);
    setPreviewUrl('');
    setErrorText('');
  }, [previewUrl]);

  const validate = useCallback(
    (f) => {
      if (!acceptTypes.includes(f.type)) {
        const msg = '仅支持 JPG / PNG';

        setErrorText(msg);
        onError?.({
          type: 'format',
          message: msg,
        });

        return false;
      }

      if (f.size > maxSize * 1024 * 1024) {
        const msg = `图片不能超过 ${maxSize}MB`;

        setErrorText(msg);

        onError?.({
          type: 'size',
          message: msg,
        });

        return false;
      }

      return true;
    },
    [acceptTypes, maxSize, onError]
  );

  const openFilePicker = useCallback(() => {
    clear();
    inputRef.current?.click();
  }, [clear]);

  const onChange = useCallback(
    (e) => {
      const f = e.target.files?.[0];

      if (!f) return;

      setErrorText('');

      if (!validate(f)) return;

      const url = URL.createObjectURL(f);

      setFile(f);
      setPreviewUrl(url);
    },
    [validate]
  );

  const confirm = useCallback(async () => {
    if (!file) return;

    try {
      await onConfirm?.(file);
      clear();
    } catch (e) {
      setErrorText('发送失败');
    }
  }, [file, onConfirm, clear]);

  return (
    <Group gap="xs" align="center">
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={acceptTypes.join(',')}
        onChange={onChange}
      />

      {!previewUrl ? (
        <Tooltip label="发送图片">
          <ActionIcon
            variant="light"
            radius="xl"
            size="lg"
            onClick={openFilePicker}
          >
            <IconPhotoPlus size={20} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <>
          <Paper
            radius="md"
            withBorder
            p={4}
          >
            <Image
              src={previewUrl}
              w={previewWidth}
              h={previewWidth}
              radius="md"
              fit="cover"
            />
          </Paper>

          <ActionIcon
            color="green"
            variant="filled"
            radius="xl"
            onClick={confirm}
          >
            <IconCheck size={18} />
          </ActionIcon>

          <ActionIcon
            color="red"
            variant="light"
            radius="xl"
            onClick={clear}
          >
            <IconX size={18} />
          </ActionIcon>
        </>
      )}

      {errorText && (
        <Text size="xs" c="red">
          {errorText}
        </Text>
      )}
    </Group>
  );
});