import React, { useEffect, useState, useRef, useTransition, useReducer, Suspense } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient } from 'hooks';
import { useRequest, useLocalStorageState } from 'ahooks';

import { Chat, Container,DialogList } from 'components';



export const Mian = () => {

    const navigate = useNavigate();
    const [dialog, setDialog] = useLocalStorageState('chat-dialog', { defaultValue: [] });


    function openMsgWindow(select) {
        setDialog(p => ({ ...p, [select.id]: select }))
        navigate('/chat/dialog/msg/', { state: { select } })
    }

    const handleClear = (item) => {
        if (!item?.id) return;
        localStorage.removeItem(item.id)
        setDialog(prev => {
            const newData = { ...prev };
            delete newData[item.id];
            return newData;
        });
    };

    return <Chat>
        <Chat.Left size={"20%"}>
            <Container verticalScroll={true} horizontalScroll={true}>
                <DialogList dialogsData={dialog} onSelectDialog={(select) => { openMsgWindow(select) }} onClear={(p) => handleClear(p)} />
            </Container>
        </Chat.Left>
        <Chat.Right size={"70%"}>
            <Outlet />
        </Chat.Right>
    </Chat>



}

