import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation, useNavigate } from "react-router-dom";
import { useDateTime, useWinSize } from 'hooks';
import { useRequest, useLocalStorageState, useVirtualList } from 'ahooks';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';
import { MsgItem, ChatMsg } from 'components/chat';
import { Container, Icon, Padding,Background } from 'components/flutter';
import { useHttpClient2 } from 'hooks/http';

export function Msg() {
    const location = useLocation();
    const navigate = useNavigate()

    const uid = location.state?.uid
    const avatar_url = location.state?.avatar_url
    const displayName = location.state?.displayName

    const [selfAvatar] = useLocalStorageState('saveOneself')
    const [msgs, setMsgs] = useState([]);
    const { http } = useHttpClient2('/rpc/chat/msg/single/')
    const { getDateTimeStr } = useDateTime()
    const { winHeight, isMobile } = useWinSize()

    const f_url = useMemo(() => { return isMobile ? '/chat/mobile/dialog/' : '/chat/dialog/' }, [isMobile])



    useEffect(() => {
        const sub = liveQuery(
            () => db.table('message').where('uid').equals(uid).reverse().toArray()
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
        itemHeight: 74,
        overscan: 10,
    });

    useEffect(() => {
        if (msgs.length > 0) {
            scrollTo(0);
        }
    }, [msgs.length, scrollTo])

    return <ChatMsg>
        <ChatMsg.Meta
            title={displayName}
            left={<Icon name="chevron-left" onClick={() => { navigate(f_url) }} />}
        />
        <ChatMsg.Content>
            <Background/>
            <Container verticalScroll={true} ref={containerRef} height={winHeight - 135}>
                <Padding>
                    <div ref={wrapperRef}>
                        {list.map((item) => {
                            return <MsgItem
                                data={item.data}
                                receiveAvatar={avatar_url}
                                sendAvatar={selfAvatar}
                            />
                        })}
                    </div>
                </Padding>
            </Container>
        </ChatMsg.Content>
        <ChatMsg.Send onSend={(newMsg) => { fnSend(uid, newMsg) }} />
    </ChatMsg >
}




