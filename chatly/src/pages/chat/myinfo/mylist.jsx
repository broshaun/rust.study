import { Suspense } from "react";
import { useNavigate } from 'react-router';
import { useHttpClient2 } from 'hooks/http';
import { useQuery } from '@tanstack/react-query';
import {  Stack, Divider, NavLink } from '@mantine/core';
import {
    IconUserCircle,
    IconMail,
    IconId,
    IconDeviceMobileMessage,
    IconTrash,
    IconLogout,
    IconChevronRight
} from '@tabler/icons-react';


export const MyList = () => {
    const navigate = useNavigate();
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/');

    const { data: apiInfo = {}, isPending: loading, error } = useQuery(
        {
            queryKey: ['api-info'],
            queryFn: async () => {
                const res = await apiLogin.requestBodyJson('GET');
                if (!res || res.code !== 200) {
                    throw new Error(res?.message || '获取失败');
                }
                return res.data;
            },
        });




    return (
        <Stack gap={0}>
            <NavLink
                py={15} px={25}
                label="头像"
                leftSection={<IconUserCircle size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => navigate("/chat/self/image/", { state: apiInfo })}
            />
            <Divider ml={45} my={0} color="gray.2" />
            <NavLink py={15} px={25}
                label={apiInfo?.email}
                leftSection={<IconMail size={20} stroke={1.5} />}
            />
            <Divider ml={45} my={0} color="gray.2" />
            <NavLink py={15} px={25}
                label={`昵称：${apiInfo?.nikename}`}
                leftSection={<IconId size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => navigate("/chat/self/name/", { state: apiInfo })}
            />
            <Divider ml={45} my={0} color="gray.2" />
            <NavLink py={15} px={25}
                label="设置手机提醒"
                leftSection={<IconDeviceMobileMessage size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => navigate("/chat/self/pushdeer/", { state: apiInfo })}
            />
            <Divider ml={45} my={0} color="gray.2" />
            <NavLink py={15} px={25}
                label="清空聊天记录"
                leftSection={<IconTrash size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => navigate("/chat/self/clear/")}   
            />
            <Divider ml={45} my={0} color="gray.2" />
            <NavLink py={15} px={25}
                label="退出当前登录"
                leftSection={<IconLogout size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => navigate("/chat/self/lgout/")}
            />
        </Stack>
    );
}

