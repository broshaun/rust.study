import React, { useEffect, useState, useRef, useTransition, useReducer, Suspense } from 'react';
import { SimpleTable, SingleRadio, InputText2, Divider, Container } from 'components';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient, useNewWindow } from 'hooks';
import { useRequest, useDebounce } from 'ahooks';
import { UserInfoCard } from 'components/chat';
import { IconCustomColor } from 'components/icon';



export const Find = () => {
    const navigate = useNavigate();
    const [apiData, setApiData] = useState([]);
    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/friend/')
    const { http: httpImgs } = useHttpClient('/imgs');
    const [keyword, setKeyword] = useState();
    const debouncedKeyword = useDebounce(keyword, { wait: 500 });

    // 查找好友
    const { runAsync: run } = useRequest((email) => {
        console.log('email', email)
        if (!email) return;
        http.requestBodyJson('POST', { 'email': email })
            .then((results) => {
                if (!results) return;
                const { code, message, data } = results
                code === 200 && startTransition(() => {
                    setApiData(data)
                })
            })
        return 'ok'
    }, { manual: true })

    // 添加好友
    const { runAsync: run2 } = useRequest((id) => {
        if (!id) return;
        http.requestBodyJson('PUT', { 'id': id })
            .then((results) => {
                if (!results) return;
                const { code, message, data } = results
                code === 200 && console.log(message)
            })
        return 'ok'
    }, { manual: true })


    const handleEmailChange = (value) => {
        setKeyword(value);

    };


    return <Suspense fallback={<div>加载中...</div>}>
        <Container alignItems='center'>
            <be/>
            <InputText2 placeholder="搜索好友" onChangeValue={handleEmailChange}>
                <InputText2.Right icon='magnifying-glass-circle' onClick={() => run(debouncedKeyword)} />
            </InputText2>
            <Divider />
            {apiData && Object.keys(apiData).length !== 0 &&
                <UserInfoCard title='用户信息' onAddFriend={(v) => { run2(v?.id); navigate('/chat/friend/'); }}>
                    <UserInfoCard.Avatar>
                        <img src={httpImgs.buildUrl(apiData.avatar_url)} />
                    </UserInfoCard.Avatar>
                    <UserInfoCard.Info>{apiData}</UserInfoCard.Info>
                </UserInfoCard>
            }
        </Container>
    </Suspense>
}

