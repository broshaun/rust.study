import React, { useTransition } from 'react'
import { useLocation } from "react-router-dom";
import { useDateTime, useHttpClient } from 'hooks';
import { ChatMsg } from 'components/chat';
import { useRequest, useLocalStorageState } from 'ahooks';





export function Msg() {
    const location = useLocation();
    const { dateTimeStr } = useDateTime()
    const query = new URLSearchParams(location.search);
    const [msgs, setMsgs] = useLocalStorageState(query?.id, { defaultValue: [] })

    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/msg/private/')


    const { runAsync: fnSend } = useRequest((msgText) => {
        http.requestBodyJson('PUT', { 'user_id': query?.id, 'msg': msgText })
            .then((results) => {
                if (!results) return;
                const { code, message, data } = results
                if (code === 200) {
                    setMsgs(p => [...p, { to: query?.id, msg: msgText, timestamp: dateTimeStr }])
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

    console.log('msgs',msgs)

    return <React.Fragment>
        <ChatMsg width={700} height={640}>
            <ChatMsg.Message>{msgs}</ChatMsg.Message>
            <ChatMsg.Send onSend={(newMsg) => { fnSend(newMsg) }} />
        </ChatMsg>
    </React.Fragment>
}




