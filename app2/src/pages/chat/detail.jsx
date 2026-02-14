import React, { useMemo, useState, useTransition } from 'react'
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useUser, useWinWidth, useHttpClient } from 'hooks';
import { ChatTransitionPage } from 'components/apps';
import { Container } from 'components/base';
import { useRequest, useLocalStorageState } from 'ahooks';
import { debug } from '@tauri-apps/plugin-log';


export function ToMsg() {
    const navigate = useNavigate();
    const location = useLocation();
    const [apiData, setApiData] = useState([]);
    const params = new URLSearchParams(location.search);


    const [isPending, startTransition] = useTransition()
    const [msgs, setMsgs] = useLocalStorageState(params.get('id'), { defaultValue: '' })

    const { http: http2 } = useHttpClient('/api/chat/friend/')
    const { loading } = useRequest(() => {
        http2.requestParams('GET', { id: params.get('id') }).then((results) => {
            if (!results) return;
            const { code, message, data } = results
            code === 200 && startTransition(() => {
                setApiData(data)
            })
        })
    }, { refreshDeps: [] })

 
    




    function openMsgWindow(select) {
        console.log('select',select)
        
        debug('++++++++++++++++++++').catch()
        debug(`select:${JSON.stringify(select)}`).catch()
        debug('++++++++++++++++++++').catch()



        if (!select?.id) return;
        
        navigate('/msg', { state: select })
    }


    return <React.Fragment>
        <Container verticalScroll={true} horizontalScroll={true}>
            <ChatTransitionPage
                friendData={apiData}
                onChat={(p) => { openMsgWindow(p) }}
            />
        </Container>

    </React.Fragment>
}




