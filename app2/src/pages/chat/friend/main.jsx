import React, { useEffect, useState, useRef, useTransition, useReducer, Suspense } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient } from 'hooks';
import { useRequest, useLocalStorageState } from 'ahooks';
import { FriendList } from 'components/apps';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { isTauri } from "@tauri-apps/api/core";
import { Chat, Container } from 'components';



export const Mian = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [apiData, setApiData] = useState([]);
    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/friend/')

    useRequest(() => {
        http.requestBodyJson('POST', { "skip": 0, "limit": 10 }).then((results) => {
            if (!results) return;
            const { code, message, data } = results
            code === 200 && startTransition(() => {
                setApiData(data)
            })
        })
    }, { refreshDeps: [], })


    function openMsgWindow(select) {
        console.log('选中了',select)
        navigate('/chat/friend/detail/', { state: { select, from: location.pathname } })
    }

    return <Chat>
        <Chat.Left size={"20%"}>
            <Container verticalScroll={true} horizontalScroll={true}>
                <FriendList friendsData={apiData?.detail} onSelectFriend={(select) => { openMsgWindow(select) }} />
            </Container>
        </Chat.Left>
        <Chat.Right size={"70%"}>
            <Outlet />
        </Chat.Right>
    </Chat>



}

