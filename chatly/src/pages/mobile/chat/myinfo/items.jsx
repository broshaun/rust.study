import { useNavigate } from 'react-router';
import { currentAppBar } from 'utils';
import { Stack, Divider, NavLink } from '@mantine/core';
import {
    IconUserCircle,
    IconMail,
    IconId,
    IconDeviceMobileMessage,
    IconTrash,
    IconLogout,
    IconChevronRight
} from '@tabler/icons-react';
import React, { useEffect } from "react";
import { loginCache } from 'http/loginCache';
import { useLocalStorage } from '@mantine/hooks';
import { useQueryCache } from 'http/useQueryCache';

export const Items = () => {
    const [userId] = useLocalStorage({ key: 'current_account' });
    const navigate = useNavigate();
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        setLeftPath(null)
        setTitle('我的信息');
        setRightPath(null);
    }, [])

    const { data: apiInfo } = useQueryCache(loginCache,userId)

    return (
        <Stack gap={0}>
            <NavLink
                py={15} px={25}
                label="头像"
                leftSection={<IconUserCircle size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => navigate("/mobile/chat/self/image/")}
            />
            <Divider ml={45} my={0} />
            <NavLink py={15} px={25}
                label={apiInfo?.email}
                leftSection={<IconMail size={20} stroke={1.5} />}
            />
            <Divider ml={45} my={0} />
            <NavLink py={15} px={25}
                label={`昵称：${apiInfo?.nickname}`}
                leftSection={<IconId size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => { navigate("/mobile/chat/self/name/") }}
            />
            <Divider ml={45} my={0} />
            <NavLink py={15} px={25}
                label="设置手机提醒"
                leftSection={<IconDeviceMobileMessage size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => { navigate("/mobile/chat/self/pushdeer/") }}
            />
            <Divider ml={45} my={0} />
            <NavLink py={15} px={25}
                label="清空聊天记录"
                leftSection={<IconTrash size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => navigate("/mobile/chat/self/clear/")}
            />
            <Divider ml={45} my={0} />
            <NavLink py={15} px={25}
                label="退出当前登录"
                leftSection={<IconLogout size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => navigate("/mobile/chat/self/lgout/")}
            />
        </Stack>

    );
}

