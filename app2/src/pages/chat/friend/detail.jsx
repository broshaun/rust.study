import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useHttpClient } from 'hooks';
import { ChatTransitionPage } from 'components/apps';
import { Container } from 'components/base';
import { useRequest, useLocalStorageState } from 'ahooks';




export function Detail() {
    const navigate = useNavigate();
    const location = useLocation();
    const [apiData, setApiData] = useState();

    const [news, setNews] = useLocalStorageState('chat-dialog', { defaultValue: [] });


    useEffect(()=>{
        if (!location.state?.select)return;
        setApiData(location.state.select)
    },[location.state])

    // const [isPending, startTransition] = useTransition()
    // const { http: http2 } = useHttpClient('/api/chat/friend/')
    // useRequest(() => {
    //     http2.requestParams('GET', { id: params.get('id') }).then((results) => {
    //         if (!results) return;
    //         const { code, message, data } = results
    //         code === 200 && startTransition(() => {
    //             setApiData(data)
    //         })
    //     })
    // }, { refreshDeps: [] })


    function openMsgWindow(select) {
        setNews(p => ({ ...p, [select.id]: select }))
        navigate('/chat/dialog/msg/', { state: { select } })
    }

    return <React.Fragment>
        <Container>
            <ChatTransitionPage
                friendData={apiData}
                onChat={(p) => { openMsgWindow(p) }}
            />
        </Container>

    </React.Fragment>
}


