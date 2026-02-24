import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from "react-router-dom";
import { useHttpClient, useDateTime } from 'hooks';
import { ChatMsg } from 'components/chat';
import { Avatar } from 'components';
import { useRequest, useLocalStorageState } from 'ahooks';
import { db, useIndexedDB } from 'hooks/db';



export function Msg() {
    const location = useLocation();
    const uid = location.state?.uid
    const avatar_url = location.state?.avatar_url
    const [selfAvatar] = useLocalStorageState('saveOneself')
    const [msgs, setMsgs] = useState([]);
    const { http } = useHttpClient('/api/chat/msg/single/')
    const { getDateTimeStr } = useDateTime()
    const { table } = useIndexedDB(db);
    const tbmsg = useMemo(() => table('messages'), [table])

    useEffect(() => {
        if (!uid) return;
        const off = tbmsg.where('uid').equals(uid).onChange((rows) => { setMsgs(rows) });
        return off;
    }, [tbmsg, uid])

    const { runAsync: fnSend } = useRequest((uid, msgText) => {
        http.requestBodyJson('PUT', { 'user_id': uid, 'msg': msgText })
            .then((results) => {
                if (!results) return;
                const { code, message, data } = results
                if (code === 200) {
                    tbmsg.put({ "uid": uid, 'msg': msgText, 'timestamp': getDateTimeStr(), 'signal': 'send' })
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
            <ChatMsg.Send onSend={(newMsg) => {   fnSend(uid, newMsg) }} />
        </ChatMsg>
    </React.Fragment>
}
