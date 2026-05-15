import { Group, Text, rem } from '@mantine/core';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';

function Demo() {
  return (
    <Dropzone
      onDrop={(files) => console.log('已接受的文件:', files)}
      onReject={(files) => console.log('被拒绝的文件:', files)}
      maxSize={3 * 1024 ** 2} // 限制 3MB
      accept={IMAGE_MIME_TYPE} // 仅接受图片
    >
      <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
        {/* 正在拖入符合条件的文件时显示 */}
        <Dropzone.Accept>
          <IconUpload size="3.2rem" stroke={1.5} color="var(--mantine-color-blue-6)" />
        </Dropzone.Accept>
        
        {/* 正在拖入不符合条件的文件时显示 */}
        <Dropzone.Reject>
          <IconX size="3.2rem" stroke={1.5} color="var(--mantine-color-red-6)" />
        </Dropzone.Reject>
        
        {/* 闲置状态显示 */}
        <Dropzone.Idle>
          <IconPhoto size="3.2rem" stroke={1.5} />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            将图片拖拽到此处或点击上传
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            每张文件不超过 5MB
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}