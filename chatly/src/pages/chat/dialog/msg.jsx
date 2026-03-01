import React, { useState, useEffect, useMemo } from '.store/react@18.3.1/node_modules/react'
import { useLocation } from "react-router-dom";
import { useHttpClient, useDateTime } from 'hooks';
import { ChatMsg } from 'components/chat';
import { Avatar } from 'components';
import { useRequest, useLocalStorageState } from 'ahooks';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';


export function Msg() {
    const location = useLocation();
    const uid = location.state?.uid
    const avatar_url = location.state?.avatar_url
    const [selfAvatar] = useLocalStorageState('saveOneself')
    const [msgs, setMsgs] = useState([]);
    const { http } = useHttpClient('/api/chat/msg/single/')
    const { getDateTimeStr } = useDateTime()

    useEffect(() => {
        const sub = liveQuery(
            () => db.table('message').where('uid').equals(uid).toArray()
        ).subscribe({
            next: rows => setMsgs(rows),
            error: console.error
        })
        return () => sub.unsubscribe()
    }, [uid])


    const { runAsync: fnSend } = useRequest((uid, msgText) => {
        http.requestBodyJson('PUT', { 'user_id': uid, 'msg': msgText })
            .then((results) => {
                if (!results) return;
                const { code } = results
                if (code === 200) {
                    db.table('message').put({ "uid": uid, 'msg': msgText, 'timestamp': getDateTimeStr(), 'signal': 'send' })
                }
            })
        return 'ok'
    }, { manual: true })

    return <React.Fragment>
        <ChatMsg
            friendAvatar={() => <Avatar src={avatar_url} size={36} roundedRadius={6} variant="rounded" fit="cover" />}
            oneselfAvatar={() => <Avatar src={selfAvatar} size={36} roundedRadius={6} variant="rounded" fit="cover" />}
        >
            <ChatMsg.Message>{msgs}</ChatMsg.Message>
            <ChatMsg.Send onSend={(newMsg) => { fnSend(uid, newMsg) }} />
        </ChatMsg>
    </React.Fragment>
}
