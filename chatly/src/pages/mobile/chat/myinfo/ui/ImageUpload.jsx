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

  // 组件销毁或预览图切换时释放内存，防止内存泄漏
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // 重置状态
  const clear = useCallback(() => {
    resetRef.current?.();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setError(false);
  }, [previewUrl]);

  // 文件选择变更处理器
  const handleFileChange = (f) => {
    if (!f) return;
    setError(false);

    // 1. 格式校验
    if (!acceptTypes.includes(f.type)) {
      onError?.({ type: 'format', message: '格式不支持' });
      setError(true);
      return;
    }
    
    // 2. 大小校验
    if (f.size > maxSize * 1024 * 1024) {
      onError?.({ type: 'size', message: `不能超过${maxSize}MB` });
      setError(true);
      return;
    }

    // 3. 校验通过，生成预览
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  // 确认上传
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
                // 优化：使用 Mantine 标准的语义化属性，动态切换错误样式
                bg={error ? "red.0" : "gray.0"}
                c={error ? "red.7" : "gray.7"}
                bd={`1px solid ${error ? 'var(--mantine-color-red-3)' : 'var(--mantine-color-gray-3)'}`}
                fw={500}
                fz={12}
                h={size}
                px={12}
                leftSection={<IconUpload size={14} />}
              >
                {btnText}
              </Button>
            )}
          </FileButton>
        ) : (
          <Group gap={20} wrap="nowrap">
            {/* 预览图容器 */}
            <Box
              h={size}
              w={previewWidth}
              bg="gray.0"
              bdr="4px" // Mantine 简写：border-radius
              bd="1px solid gray.3" // Mantine 简写：border
              style={{ overflow: 'hidden' }}
            >
              <Image src={previewUrl} h="100%" w="100%" fit="cover" alt="Preview" />
            </Box>

            {/* 操作按钮组 */}
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
        <Text c="red.7" fz={11} mt={4} style={{ whiteSpace: 'nowrap' }}>
          图片格式/大小错误
        </Text>
      )}
    </Box>
  );
});

ImageUpload.displayName = 'ImageUpload';