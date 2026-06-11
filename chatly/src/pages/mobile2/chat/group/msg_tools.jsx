import React, { useEffect } from "react";
import { useNavigate } from 'react-router';
import { Group, ActionIcon, Text, UnstyledButton, Box } from "@mantine/core";
import {
    IconPhoto,
    IconMoodSmile,
    IconFlask,
    IconPhotoUp,
    IconPhoneOutgoing
} from '@tabler/icons-react';
import { currentAppBar } from "utils";

// 静态配置移出组件，避免每次 Render 重复创建，提升性能
const TOOLS_CONFIG = [
    { 
        id: 'smile', 
        icon: IconMoodSmile, 
        label: '表情', 
        path: '/mobile/chat/group/smile',
        color: 'grape' 
    },
    { 
        id: 'imgUp', 
        icon: IconPhotoUp, 
        label: '发送图片', 
        path: '/mobile/chat/group/imgUp',
        color: 'teal' 
    },

];

export function Tools() {
    const navigate = useNavigate();
    const setLeftPath = currentAppBar((state) => state.setLeftPath);

    useEffect(() => {
        setLeftPath('/mobile/chat/message/');
    }, [setLeftPath]);

    return (
        <Box p="xs" style={{ overflowX: 'auto' }}>
            <Group justify="space-around" align="flex-start" wrap="nowrap" gap="sm">
                {TOOLS_CONFIG.map(({ id, icon: Icon, label, path, color }) => (
                    <UnstyledButton
                        key={id}
                        onClick={() => navigate(path)}
                        style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '6px'
                        }}
                    >
                        <ActionIcon
                            component="div" 
                            variant="light"
                            color={color}
                            size="xl"
                            radius="md"
                        >
                            <Icon size={24} stroke={1.5} />
                        </ActionIcon>
                        
                        <Text size="xs" fw={500} c="dimmed">
                            {label}
                        </Text>
                    </UnstyledButton>
                ))}
            </Group>
        </Box>
    );
}