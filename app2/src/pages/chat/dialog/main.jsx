import React, { useEffect, useState, useRef, useTransition, useReducer, Suspense } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient, useDateTime } from 'hooks';
import { useRequest, useLocalStorageState } from 'ahooks';
import { Chat, Container, DialogList } from 'components';
import { db, useIndexedDB } from 'hooks/db';


export const Mian = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [dialog, setDialog] = useLocalStorageState('chat-dialog', { defaultValue: {} });
    const [isPending, startTransition] = useTransition()
    const { http: httpImgs } = useHttpClient('/imgs');
    const { http: httpMsg } = useHttpClient('/api/chat/msg/private/')
    const { table } = useIndexedDB(db);
    const tbmsg = table('messages');


    useRequest(() => {
        httpMsg.requestParams('GET').then((results) => {
            if (!results) return;
            const { code, data } = results
            startTransition(() => {
                if (data && code === 200) tbmsg.put({ ...data, signal: 'receive' })
            })
        })
        return 'ok'
    }, { pollingInterval: 1000, pollingWhenHidden: false })


    function openMsgWindow(select) {
        navigate('/chat/dialog/msg/', { state: { select } })
    }

    const handleClear = (item) => {
        if (!item?.friend_id) return;
        tbmsg.delete({ uid: item.friend_id })

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
            <Outlet context={{}} />
        </Chat.Right>
    </Chat>



}


