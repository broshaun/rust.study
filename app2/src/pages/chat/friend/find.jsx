import React, { useState, useTransition, Suspense } from 'react';
import { InputText2, Divider, Container } from 'components';
import { useNavigate } from 'react-router-dom';
import { useHttpClient, useWinWidth } from 'hooks';
import { useRequest, useDebounce } from 'ahooks';
import { UserInfoCard } from 'components/chat';



export const Find = () => {
    const navigate = useNavigate();
    const [apiData, setApiData] = useState([]);

    const { http } = useHttpClient('/api/chat/friend/')
    const { http: httpImgs } = useHttpClient('/imgs');
    const [keyword, setKeyword] = useState();
    const debouncedKeyword = useDebounce(keyword, { wait: 500 });
    const { isMobile } = useWinWidth()

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


    return <Suspense fallback={<div>加载中...</div>}>
        <Container alignItems='center'>
            <be />
            <InputText2 placeholder="搜索好友" onChangeValue={handleEmailChange}>
                <InputText2.Right icon='magnifying-glass-circle' onClick={() => run(debouncedKeyword)} />
            </InputText2>
            <Divider />
            {!loading && Object.keys(user || {}).length !== 0 &&
                <UserInfoCard title='用户信息' onAddFriend={(v) => { run2(v?.id); isMobile ? navigate('/chat/mobile/friend/') : navigate('/chat/friend/'); }}>
                    <UserInfoCard.Avatar>
                        <img src={httpImgs.buildUrl(user?.avatar_url)} />
                    </UserInfoCard.Avatar>
                    <UserInfoCard.Info>{user}</UserInfoCard.Info>
                </UserInfoCard>
            }
        </Container>
    </Suspense>
}

