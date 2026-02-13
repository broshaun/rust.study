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
    const params = new URLSearchParams(location.search);

    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/msg/private/')
    const [msgs, setMsgs] = useState([
        // { from: "698d51f3d63d2413753b8bdd", msg: "来自对方的消息。。。", timestamp: "2026-02-12 16:15:22" },
        // { from: "698d51f3d63d2413753b8bdd", msg: "来自对方的消息。。。", timestamp: "2026-02-12 16:15:22" },
        // { from: "698d51f3d63d2413753b8bdd", msg: "来自对方的消息。。。", timestamp: "2026-02-12 16:15:22" },
        // { to: "698d51f3d63d2413753b8bdd", msg: "收到～", timestamp: "2026-02-12 16:15:22" },
        // { to: "698d51f3d63d2413753b8bdd", msg: "继续发", timestamp: "2026-02-12 16:15:22" },
        // { to: "698d51f3d63d2413753b8bdd", msg: "OK", timestamp: "2026-02-12 16:15:22" },
    ])

    const { data, runAsync: fnSend } = useRequest((msgText) => {
        http.requestBodyJson('PUT', { 'user_id': params.get('id'), 'msg': msgText })
            .then((results) => {
                if (!results) return;
                const { code, message, data } = results
                if (code === 200) {
                    setMsgs(p => [...p, { to: params.get('id'), msg: msgText, timestamp: nowStr() }])
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
            <ChatMsg.Head title='标题' leftIcon='left-chevron' onClick={() => window.close()} />
            <ChatMsg.Message>{msgs}</ChatMsg.Message>
            <ChatMsg.Send onSend={(newMsg) => { fnSend(newMsg) }} />
        </ChatMsg>
    </React.Fragment>
}




