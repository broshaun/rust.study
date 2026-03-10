import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from "react-router-dom";
import { useHttpClient, useDateTime, useWinSize } from 'hooks';
import { useRequest, useLocalStorageState, useVirtualList } from 'ahooks';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';
import { MsgItem, ChatMsg } from 'components/chat';
import { Container, Icon, Avatar } from 'components/flutter';



export function Msg() {
    const location = useLocation();
    const uid = location.state?.uid
    const avatar_url = location.state?.avatar_url
    const [selfAvatar] = useLocalStorageState('saveOneself')
    const [msgs, setMsgs] = useState([]);
    const { http } = useHttpClient('/api/chat/msg/single/')
    const { getDateTimeStr } = useDateTime()
    const { winHeight } = useWinSize()



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



    const containerRef = useRef(null);
    const wrapperRef = useRef(null)
    const [list, scrollTo] = useVirtualList(msgs, {
        containerTarget: containerRef,
        wrapperTarget: wrapperRef,
        itemHeight: 44,
        overscan: 5,
    });

    useEffect(() => {
        if (msgs.length > 0) {
            requestAnimationFrame(() => {
                scrollTo(msgs.length - 1);
            });
        }
    }, [msgs.length]);



    return <ChatMsg>
        <ChatMsg.Meta
            title="张三"
            left={<Icon name="chevron-left" />}
            receiveAvatar={() => <Avatar src={avatar_url} size={36} roundedRadius={6} variant="rounded" fit="cover" />}
            sendAvatar={() => <Avatar src={selfAvatar} size={36} roundedRadius={6} variant="rounded" fit="cover" />}
        />
        <ChatMsg.Content>
            <Container verticalScroll={true} ref={containerRef} margin={10} height={winHeight - 180}>
                <div ref={wrapperRef}>
                    {list.map((item) => {
                        return <MsgItem data={item.data} />
                    })}
                </div>
            </Container>
        </ChatMsg.Content>
        <ChatMsg.Send onSend={(newMsg) => { fnSend(uid, newMsg) }} />
    </ChatMsg>
}
