import React, { useTransition, useState, useEffect, useMemo } from 'react'
import { useLocation } from "react-router-dom";
import { useHttpClient, useDateTime } from 'hooks';
import { ChatMsg } from 'components/chat';
import { useRequest } from 'ahooks';
import { db, useIndexedDB } from 'hooks/db';



export function Msg() {
    const location = useLocation();
    const uid = useMemo(() => location.state?.user_id, [location.state])

    const { table } = useIndexedDB(db);
    const tbmsg = table('messages');

    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/msg/private/')
    const { getDateTimeStr } = useDateTime()

    const [msgs, setMsgs] = useState()
    const { runAsync: fnSend } = useRequest((uid, msgText) => {
        http.requestBodyJson('PUT', { 'user_id': uid, 'msg': msgText })
            .then((results) => {
                if (!results) return;
                const { code, message, data } = results
                if (code === 200) {
                    startTransition(() => {
                        tbmsg.put({ "uid": uid, 'msg': msgText, 'timestamp': getDateTimeStr(), 'signal': 'send' })
                    })

                }
            })
        return 'ok'
    }, { manual: true })


    useEffect(() => {
        if (!uid) return;
        tbmsg.find({ uid }).then((res) => {
            setMsgs(res || []);
        });
    }, [location.state, tbmsg]);


    return <React.Fragment>
        <ChatMsg>
            <ChatMsg.Message>{msgs}</ChatMsg.Message>
            <ChatMsg.Send onSend={(newMsg) => { fnSend(uid, newMsg) }} />
        </ChatMsg>
    </React.Fragment>
}
