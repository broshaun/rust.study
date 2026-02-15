import React, { useEffect, useState, useRef, useTransition, useReducer, Suspense } from 'react';
import { SimpleTable, SingleRadio, InputText, Divider, Container } from 'components';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient, useNewWindow } from 'hooks';
import { useRequest, useDebounce } from 'ahooks';
import { UserInfoCard } from 'components/chat';
import { IconCustomColor } from 'components/icon';



export const Find = () => {
    const navigate = useNavigate();
    const [apiData, setApiData] = useState([]);
    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/friend/find/')
    const { http: http2 } = useHttpClient('/api/chat/friend/')
    const [keyword, setKeyword] = useState();
    const debouncedKeyword = useDebounce(keyword, { wait: 500 });


    const { runAsync: run } = useRequest((email) => {
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


    const { runAsync: run2 } = useRequest((id) => {
        if (!id) return;
        http2.requestBodyJson('PUT', { 'id': id })
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
        <InputText
            right_icon='magnifying-glass-circle'
            placeholder="搜索好友"
            onChangeValue={handleEmailChange}
            right_icon_onClick={() => run(debouncedKeyword)}
        />
        <Divider />
        {apiData && Object.keys(apiData).length !== 0 &&
            <Container verticalScroll={true} horizontalScroll={true}>
                <UserInfoCard email={apiData?.email} id={apiData?.id} onAddFriend={(v) => { run2(v?.id) }} />
            </Container>
        }
    </Suspense>
}