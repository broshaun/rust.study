import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { Group, Button, ActionIcon, Tooltip, Text, Box, FileButton, Image } from "@mantine/core";
import { IconCheck, IconX, IconUpload } from "@tabler/icons-react";

export const ImageUpload = memo(({
  onConfirm,
  maxSize = 5,
  acceptTypes = ['image/jpeg', 'image/png'],
  btnText = '上传',
  size = '32px',
  previewWidth = '38px',
  onError
}) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState(false);
  const resetRef = useRef(null);

  // 清理内存
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const clear = useCallback(() => {
    resetRef.current?.();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setError(false);
  }, [previewUrl]);

  const handleFileChange = (f) => {
    if (!f) return;
    setError(false);

    // 校验逻辑
    if (!acceptTypes.includes(f.type)) {
      onError?.({ type: 'format', message: '格式不支持' });
      setError(true);
      return;
    }
    if (f.size > maxSize * 1024 * 1024) {
      onError?.({ type: 'size', message: `不能超过${maxSize}MB` });
      setError(true);
      return;
    }

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleConfirm = async () => {
    if (!file) return;
    try {
      await onConfirm?.(file);
    } finally {
      clear();
    }
  };

  return (
    <Box w="fit-content">
      <Group gap={6} align="center" wrap="nowrap" h={size}>
        {!previewUrl ? (
          <FileButton 
            resetRef={resetRef} 
            onChange={handleFileChange} 
            accept={acceptTypes.join(',')}
          >
            {(props) => (
              <Button
                {...props}
                variant="filled"
                color={error ? "red.1" : "gray.0"}
                c={error ? "red.7" : "gray.7"}
                fw={500}
                fz={12}
                h={size}
                px={12}
                leftSection={<IconUpload size={14} />}
                style={{ border: '1px solid var(--mantine-color-gray-3)' }}
              >
                {btnText}
              </Button>
            )}
          </FileButton>
        ) : (
          <Group gap={20} wrap="nowrap">
            {/* 预览图 */}
            <Box
              h={size}
              w={previewWidth}
              style={{
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: 'var(--mantine-color-gray-0)'
              }}
            >
              <Image src={previewUrl} h="100%" w="100%" fit="cover" alt="Preview" />
            </Box>

            {/* 操作组 */}
            <Group gap={8} wrap="nowrap">
              <Tooltip label="确定" fz={10}>
                <ActionIcon
                  variant="subtle"
                  color="green"
                  onClick={handleConfirm}
                  size={size}
                >
                  <IconCheck size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="取消" fz={10}>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={clear}
                  size={size}
                >
                  <IconX size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        )}
      </Group>

      {error && (
        <Text c="red" fz={11} mt={2} style={{ whiteSpace: 'nowrap' }}>
          图片格式/大小错误
        </Text>
      )}
    </Box>
  );
});
