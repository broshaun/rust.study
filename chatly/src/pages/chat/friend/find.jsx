import React, { useState, Suspense } from 'react';
import { InputText2, Container } from 'components';
import { useHttpClient2 } from 'hooks/http';
import { useRequest, useDebounce } from 'ahooks';
import { UserInfoCard } from 'components/chat';
import { Divider } from 'components/flutter';


export const Find = () => {
    const { http } = useHttpClient2('/rpc/chat/friend/')
    const { endpoint} = useHttpClient2('/imgs');
    const [keyword, setKeyword] = useState();
    const debouncedKeyword = useDebounce(keyword, { wait: 500 });


    // 查找好友
    const { data: user, loading, runAsync: run } = useRequest(
        async (email) => {
            if (!email) return;
            const results = await http.requestBodyJson('POST', { 'email': email });
            if (!results) return;
            const { code, message, data } = results
            if (code === 200) return data;
        }, { manual: true })

    // 添加好友
    const { runAsync: run2 } = useRequest(
        async (user_id) => {
            if (!user_id) return;
            await http.requestBodyJson('PUT', { 'user_id': user_id })
            return 'ok'
        }, { manual: true })

    const handleEmailChange = (value) => {
        setKeyword(value);
    };

    // 好友请求
    const { loading: loading2, data: askFriends } = useRequest(
        async () => {
            try {
                const { code, data } = await http.requestParams('GET', { ask_state: 'await' })
                if (code === 200) {
                    return data?.detail || [];
                }
            } catch {
                console.error
            }
        }, { refreshDeps: [] })



    // 通过请求
    const { runAsync: isPass } = useRequest(
        async (id, ask_state) => {
            await http.requestBodyJson('PATCH', { 'id': id, "ask_state": ask_state })
            return 'ok'
        }, { manual: true }
    )


    return <Suspense fallback={<div>加载中...</div>}>
        <Container alignItems='center' verticalScroll={true}>
            <br />
            <InputText2 placeholder="搜索好友" onChangeValue={handleEmailChange}>
                <InputText2.Right icon='magnifying-glass-circle' onClick={() => run(debouncedKeyword)} />
            </InputText2>
            <Divider />
            {!loading && Object.keys(user || {}).length !== 0 &&
                <UserInfoCard
                    background="#f5f8ff"
                    butText='添加好友'
                    title='用户信息'
                    onAddFriend={(v) => { run2(v?.id) }}
                >
                    <UserInfoCard.Avatar>
                        <img src={`${endpoint}/${user?.avatar_url}`} />
                    </UserInfoCard.Avatar>
                    <UserInfoCard.Info>{user}</UserInfoCard.Info>
                </UserInfoCard>
            }
            <Divider />
            {!loading2 && askFriends.map(user =>
                <UserInfoCard
                    background="#FFF9E8"
                    title='好友请求'
                    butText='通过'
                    onAddFriend={(v) => { isPass(v?.id, 'agree') }}
                    refuseText='拒绝'
                    refuseAdd={(v) => { isPass(v?.id, 'refuse') }}
                >
                    <UserInfoCard.Avatar>
                        <img src={`${endpoint}/${user?.avatar_url}`} />
                    </UserInfoCard.Avatar>
                    <UserInfoCard.Info>{user}</UserInfoCard.Info>
                </UserInfoCard>
            )}

        </Container>
    </Suspense>
}

