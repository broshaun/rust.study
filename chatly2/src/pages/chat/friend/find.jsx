import React, { useState, Suspense } from "react";
import { InputText2, } from 'components';
import { useHttpClient2 } from 'hooks/http';
import { UserInfoCard } from 'components/chat';
import { Divider, YBox } from 'components/flutter';
import { useMutation, useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@mantine/hooks';


export const Find = () => {
    const { http } = useHttpClient2('/rpc/chat/friend/')
    const { endpoint } = useHttpClient2('/imgs');
    const [keyword, setKeyword] = useState();
    const [debouncedKeyword] = useDebouncedValue(keyword, 500);

    // 查找好友
    const { data: findByUser, isPending: loading, mutateAsync: run } = useMutation(
        {
            mutationFn: async (email) => {
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
            mutationFn: async (user_id) => {
                if (!user_id) return;
                const { code, message, data } = await http.requestBodyJson('PUT', { 'user_id': user_id })
                console.log(code, message, data)
                return 'ok'
            },
        }
    );
    const handleEmailChange = (value) => {
        setKeyword(value);
    };

    // 好友请求
    const { data: askFriends, isPending: loading2 } = useQuery(
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

    // 通过请求
    const { mutateAsync: isPass } = useMutation(
        {
            mutationFn: async (id, ask_state) => {
                if (!id && ask_state) return;
                await http.requestBodyJson('PATCH', {
                    id, ask_state,
                });
                return 'ok';
            },
        }
    );

    return <Suspense fallback={<div>加载中...</div>}>

        <YBox align='center' verticalScroll={true} gap={10} padding={10}>

            <InputText2 placeholder="搜索好友" onChangeValue={handleEmailChange}>
                <InputText2.Right icon='magnifying-glass-circle' onClick={() => run(debouncedKeyword)} />
            </InputText2>

            <Divider />
            {!loading && Object.keys(findByUser || {}).length !== 0 &&
                <UserInfoCard
                    background="#FFF9E8"
                    title='用户信息'
                    actionText='添加'
                    onAction={(type) => {
                        if (type === 'accept') { addFriend(findByUser?.id) }
                    }}
                >
                    <UserInfoCard.Avatar>
                        <img src={`${endpoint}/${findByUser?.avatar_url}`} />
                    </UserInfoCard.Avatar>
                    <UserInfoCard.Info>{findByUser}</UserInfoCard.Info>
                </UserInfoCard>

            }

            {!loading2 && askFriends.map(user =>

                <UserInfoCard
                    background="#FFF9E8"
                    title="好友请求"
                    actionText="通过"
                    refuseText="拒绝"
                    onAction={(type) => {
                        if (type === 'accept') {
                            return isPass(user?.id, 'agree');
                        }
                        if (type === 'refuse') {
                            return isPass(user?.id, 'refuse');
                        }
                    }}
                >
                    <UserInfoCard.Avatar>
                        <img src={`${endpoint}/${user?.avatar_url}`} />
                    </UserInfoCard.Avatar>
                    <UserInfoCard.Info>{user}</UserInfoCard.Info>
                </UserInfoCard>

            )}

        </YBox>
    </Suspense>
}

