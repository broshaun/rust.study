import React, { useState, Suspense, useEffect } from "react";
import { useHttpClient, useImgApiBase, currentAppBar } from 'utils';
import { SafeAvatar } from 'components'; // 保留 SafeAvatar
import { useMutation, useQuery } from '@tanstack/react-query'
import { ScrollArea, Stack, Divider, TextInput, ActionIcon } from "@mantine/core"; // 引入原生 Divider
import { IconSearch } from "@tabler/icons-react";
import { UserInfoCard } from "./UI/UserInfoCard";

export const Find = () => {
    const { http } = useHttpClient('/rpc/chat/friend/')
    const { joinPath } = useImgApiBase('avatar')
    const [keywordEmail, setKeywordEmail] = useState();

    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    useEffect(() => {
        setLeftPath('/mobile/chat/friend/')
        setTitle('好友查找');
        setRightIcon(null)
        setRightPath(null)
    }, [])

    // 查找好友
    const { data: findByUser, isPending: loading, mutateAsync: run } = useMutation(
        {
            mutationFn: async ({ email }) => {
                if (!email) return;
                const results = await http.requestBodyJson('POST', { 'email': email });
                if (!results) return;
                const { code, message, data } = results;
                if (code === 200) return data;
                return data;
            },
        }
    );

    // 添加好友
    const { mutateAsync: addFriend } = useMutation(
        {
            mutationFn: async ({ user_id }) => {
                if (!user_id) return;
                const { code, message, data } = await http.requestBodyJson('PUT', { 'user_id': user_id })
                console.log(code, message, data)
                return 'ok'
            },
        }
    );

    const handleEmailChange = (value) => {
        setKeywordEmail(value);
    };

    // 好友请求
    const { data: askFriends = [], isPending: loading2 } = useQuery(
        {
            queryKey: ['ask-friends'],
            queryFn: async () => {
                try {
                    const { code, data } = await http.requestBodyJson('GET', {
                        ask_state: 'await',
                    });
                    if (code === 200) {
                        return data?.detail || [];
                    }
                    return [];
                } catch (error) {
                    console.error(error);
                    return [];
                }
            },
        });

    // 通过/拒绝请求
    const { mutateAsync: isPass } = useMutation(
        {
            mutationFn: async ({ id, ask_state }) => {
                if (!id || !ask_state) return;
                const { code, message, data } = await http.requestBodyJson('PATCH', {
                    id, ask_state,
                });
                console.log("code, message, data", code, message, data)
                return 'ok';
            },
        }
    );

    return (
        <Suspense fallback={<div>加载中...</div>}>
            <ScrollArea h="100%" type="auto">
                <Stack gap={10} p={10}>
                    <TextInput
                        placeholder="搜索好友"
                        value={keywordEmail}
                        onChange={(e) => handleEmailChange(e.currentTarget.value)}
                        rightSection={
                            <ActionIcon
                                variant="subtle"
                                onClick={() => run({ email: keywordEmail })}
                            >
                                <IconSearch size={18} />
                            </ActionIcon>
                        }
                    />

                    {/* 🔥 替换为原生渐变淡化 Divider */}
                    <Divider 
                        styles={{
                            root: {
                                border: 'none',
                                height: '1px',
                                opacity: 0.3,
                                backgroundImage: 'linear-gradient(to right, transparent, light-dark(rgba(0,0,0,0.8), rgba(255,255,255,0.8)) 50%, transparent)'
                            }
                        }} 
                    />

                    {!loading && findByUser && Object.keys(findByUser).length !== 0 && (
                        <UserInfoCard
                            background="#FFF9E8"
                            title='用户信息'
                            actionText='添加'
                            onAction={(type) => {
                                if (type === 'accept') { addFriend({ user_id: findByUser?.id }) }
                            }}
                        >
                            <UserInfoCard.Avatar>
                                <SafeAvatar size={60} stretch={true} url={joinPath(findByUser?.avatar_url)} />
                            </UserInfoCard.Avatar>
                            <UserInfoCard.Info>{findByUser}</UserInfoCard.Info>
                        </UserInfoCard>
                    )}

                    {!loading2 && askFriends.map(user => (
                        <UserInfoCard
                            key={user.id}
                            background="#FFF9E8"
                            title="好友请求"
                            actionText="通过"
                            refuseText="拒绝"
                            onAction={(type) => {
                                if (type === 'accept') {
                                    return isPass({ id: user?.id, ask_state: 'agree' });
                                }
                                if (type === 'refuse') {
                                    return isPass({ id: user?.id, ask_state: 'refuse' });
                                }
                            }}
                        >
                            <UserInfoCard.Avatar>
                                <SafeAvatar size={60} stretch={true} url={joinPath(user?.avatar_url)} />
                            </UserInfoCard.Avatar>
                            <UserInfoCard.Info>{user}</UserInfoCard.Info>
                        </UserInfoCard>
                    ))}
                </Stack>
            </ScrollArea>
        </Suspense>
    );
};