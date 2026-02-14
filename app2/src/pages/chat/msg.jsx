import React, { useMemo, useState, useTransition } from 'react'
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useUser, useWinWidth, useHttpClient } from 'hooks';
import { ChatMsg } from 'components/apps';
import { useRequest, useLocalStorageState } from 'ahooks';

const nowStr = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};


export function Msg() {
    const navigate = useNavigate();
    const location = useLocation();
    const [apiData, setApiData] = useState(location.state);
    


    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/msg/private/')
    const [msgs, setMsgs] = useLocalStorageState(apiData?.id, { defaultValue: [] })

    const { http: http2 } = useHttpClient('/api/chat/friend/')
    console.log('http2', http2)
    const { loading } = useRequest(() => {
        http2.requestParams('GET', { id: apiData?.id }).then((results) => {
            if (!results) return;
            const { code, message, data } = results
            code === 200 && startTransition(() => {
                setApiData(data)
            })
        })
    }, { refreshDeps: [] })


    const { runAsync: fnSend } = useRequest((msgText) => {
        http.requestBodyJson('PUT', { 'user_id': apiData?.friend_id, 'msg': msgText })
            .then((results) => {
                if (!results) return;
                const { code, message, data } = results
                if (code === 200) {
                    setMsgs(p => [...p, { to: apiData?.id, msg: msgText, timestamp: nowStr() }])
                    console.log('发送成功')
                }
            })
        return 'ok'
    }, { manual: true })

    useRequest(() => {
        http.requestParams('GET')
            .then((results) => {
                if (!results) return;
                const { code, data } = results
                startTransition(() => {
                    if (data && code === 200) setMsgs(p => [...p, data])
                })
            })
        return 'ok'
    }, { pollingInterval: 2000, pollingWhenHidden: false })


    return <React.Fragment>
        <ChatMsg width={700} height={640}>
            <ChatMsg.Head title={apiData?.remark} leftIcon='left-chevron' onClick={() => window.close()} />
            <ChatMsg.Message>{msgs}</ChatMsg.Message>
            <ChatMsg.Send onSend={(newMsg) => { fnSend(newMsg) }} />
        </ChatMsg>
    </React.Fragment>
}




