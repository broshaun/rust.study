import { useNavigate } from 'react-router';
import { useHttpClient, currentAppBar } from 'utils';
import { useQuery } from '@tanstack/react-query';
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


export const Items = () => {
    const navigate = useNavigate();

    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        setLeftPath(null)
        setTitle('我的信息');
        setRightPath(null);
    }, [])

    const { http: apiLogin } = useHttpClient('/rpc/chat/login/');
    const { data: apiInfo = {}, isPending: loading, error, refetch } = useQuery(
        {
            queryKey: ['api-info'],
            queryFn: async () => {
                const res = await apiLogin.requestBodyJson('GET');
                if (!res || res.code !== 200) {
                    throw new Error(res?.message || '获取失败');
                }
                return res.data;
            },
            staleTime: 10,
        });

    return (

        <Stack gap={0}>
            <NavLink
                py={15} px={25}
                label="头像"
                leftSection={<IconUserCircle size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => navigate("/mobile/chat/self/image/", { state: apiInfo })}
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
                onClick={() => { navigate("/mobile/chat/self/name/", { state: apiInfo }); refetch(); }}
            />
            <Divider ml={45} my={0} />
            <NavLink py={15} px={25}
                label="设置手机提醒"
                leftSection={<IconDeviceMobileMessage size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => { navigate("/mobile/chat/self/pushdeer/", { state: apiInfo }); refetch(); }}
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

