import React, { useState, useEffect, Suspense, useTransition } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useHttpClient } from 'hooks';
import { ChatTransitionPage, UserChat } from 'components/chat';
import { Container } from 'components';
import { useRequest, useLocalStorageState } from 'ahooks';




export function Detail() {
    const navigate = useNavigate();
    const location = useLocation();
    const [apiData, setApiData] = useState();
    const [isPending, startTransition] = useTransition()
    const [dialog, setDialog] = useLocalStorageState('chat-dialog', { defaultValue: {} });
    const { http: httpImgs } = useHttpClient('/imgs');
    const { http: http2 } = useHttpClient('/api/chat/friend/')



    useEffect(() => {
        if (!location.state?.select) return;
        setApiData(location.state.select)

    }, [location.state])



    const { runAsync: delFid } = useRequest((id) => {
        http2.requestBodyJson('DELETE', { id }).then((results) => {
            if (!results) return;
            const { code, message, data } = results
            console.log('results', results)
        })
    }, { manual: true })


    function openMsgWindow(select) {
        setDialog(p => ({ ...p, [select.friend_id]: select }))
        navigate('/chat/dialog/msg/', { state: { select } })
    }

    return <Suspense fallback={<div>加载中...</div>}>
        <Container alignItems='center'>
            <br/>
            {apiData &&

                <UserChat friendData={apiData} buildAvatarUrl={(name) => httpImgs.buildUrl(name)}>
                    <UserChat.Msg lable='发起聊天' onClick={(p) => { openMsgWindow(p) }} />
                    {/* <UserChat.Video lable='发起视频' onClick={(value) => { console.log('点击选中了', value) }} /> */}
                    <UserChat.Delete lable='删除好友' onClick={(v) => { delFid(v?.id); navigate('/chat/friend/') }} />
                </UserChat>
            }
        </Container>

    </Suspense>
}


