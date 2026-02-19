import React, { useEffect, useState, useRef, useTransition, useReducer, Suspense } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient,useDateTime } from 'hooks';
import { useRequest, useLocalStorageState } from 'ahooks';

import { Chat, Container, DialogList } from 'components';



export const Mian = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [dialog, setDialog] = useLocalStorageState('chat-dialog', { defaultValue: {} });
    const { http: httpImgs } = useHttpClient('/imgs');
  


    function openMsgWindow(select) {
        navigate('/chat/dialog/msg/', { state: { select } })
    }

    const handleClear = (item) => {
        if (!item?.friend_id) return;
        localStorage.removeItem(item.friend_id) // 聊天记录删除
        setDialog(prev => {
            const newData = { ...prev };
            delete newData[item.friend_id];
            return newData;
        });
        navigate('/chat/dialog/')
    };


    return <Chat>
        <Chat.Left size={"20%"}>
            <Container verticalScroll={true} >
                <DialogList
                    dialogsData={dialog}
                    onSelectDialog={(select) => { openMsgWindow(select) }}
                    onClear={(p) => handleClear(p)}
                    buildAvatarUrl={(name) => httpImgs.buildUrl(name)}
                />
            </Container>
        </Chat.Left>
        <Chat.Right size={"70%"}>
            <Outlet />
        </Chat.Right>
    </Chat>



}


