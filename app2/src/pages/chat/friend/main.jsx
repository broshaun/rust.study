import React, { useEffect, useState, useRef, useTransition, useReducer, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient } from 'hooks';
import { useRequest } from 'ahooks';
import { FriendList } from 'components/chat';
import { Chat, Container } from 'components';



export const Mian = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [apiData, setApiData] = useState([]);
    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/friend/')
    const { http: httpImgs } = useHttpClient('/imgs');

    useRequest(() => {
        http.requestParams('GET').then((results) => {
            if (!results) return;
            const { code, message, data } = results
            code === 200 && startTransition(() => {
                setApiData(data)
            })
        })
    }, { refreshDeps: [location.pathname] })



    function openMsgWindow(select) {
        navigate('/chat/friend/detail/', { state: { select, from: location.pathname } })
    }


    return <Suspense fallback={<div>加载中...</div>}>
        <Chat>
            <Chat.Left size={"20%"}>
                <Container verticalScroll={true} >
                    <FriendList
                        data={apiData}
                        onSelectFriend={(select) => { openMsgWindow(select) }}
                        buildAvatarUrl={(name) => httpImgs.buildUrl(name)}
                    />
                </Container>
            </Chat.Left>
            <Chat.Right size={"70%"}>
                <Outlet />
            </Chat.Right>
        </Chat>
    </Suspense>

}

