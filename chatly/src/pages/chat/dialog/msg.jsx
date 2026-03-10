import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from "react-router-dom";
import { useHttpClient, useDateTime, useWinSize } from 'hooks';


import { useRequest, useLocalStorageState } from 'ahooks';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';
import { MsgItem, ChatMsg } from 'components/chat';
import { Column, Border, Divider, Container, Row, Right, Icon, Avatar, AppShell, ListView } from 'components/flutter';




export function Msg() {
    const location = useLocation();
    const uid = location.state?.uid
    const avatar_url = location.state?.avatar_url
    const [selfAvatar] = useLocalStorageState('saveOneself')
    const [msgs, setMsgs] = useState([]);
    const { http } = useHttpClient('/api/chat/msg/single/')
    const { getDateTimeStr } = useDateTime()



    const { winHeight } = useWinSize()

    console.log('winHeight', winHeight)

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

    return <ChatMsg>
        <ChatMsg.Meta
            title="张三"
            left={<Icon name="chevron-left" />}
            receiveAvatar={() => <Avatar src={avatar_url} size={36} roundedRadius={6} variant="rounded" fit="cover" />}
            sendAvatar={() => <Avatar src={selfAvatar} size={36} roundedRadius={6} variant="rounded" fit="cover" />}
        />
        <ChatMsg.Content height={winHeight - 120}>
            <ListView
                itemCount={msgs.length}
                itemHeight={75}
                buffer={25}
                itemBuilder={(index) => {
                    return <MsgItem data={msgs[index]} />
                }}
            />
        </ChatMsg.Content>
        <ChatMsg.Send
            onSend={(newMsg) => { console.log('newMsg', newMsg) }}
        />
    </ChatMsg>
}
