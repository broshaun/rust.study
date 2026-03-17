import React, { useState, useEffect, useRef, useMemo } from "react"
import { useLocation, useNavigate } from "react-router";
import { useDateTime, useWinSize } from 'hooks';
import { useRequest, useLocalStorageState, useVirtualList } from 'ahooks';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';
import { MsgItem, ChatMsg } from 'components/chat';
import { Icon, YBox } from 'components/flutter';
import { useHttpClient2 } from 'hooks/http';
import { useApiBase } from 'hooks/http';

export function Msg() {

    const location = useLocation();
    const navigate = useNavigate();

    const uid = location.state?.uid;
    const displayName = location.state?.displayName;

    const [selfAvatar] = useLocalStorageState('myAvatar');

    const [msgs, setMsgs] = useState([]);

    const { apiBase } = useApiBase();

    const receiveAvatarSrc = useMemo(() => {
        if (!location.state?.avatar_url) return "";
        return `${apiBase}/imgs/${location.state.avatar_url}`;
    }, [apiBase, location.state?.avatar_url]);

    const sendAvatarSrc = useMemo(() => {
        if (!selfAvatar) return "";
        return `${apiBase}/imgs/${selfAvatar}`;
    }, [apiBase, selfAvatar]);

    const { http } = useHttpClient2('/rpc/chat/msg/single/');
    const { getDateTimeStr } = useDateTime();
    const { winHeight, isMobile } = useWinSize();

    const f_url = useMemo(() => {
        return isMobile ? '/chat/mobile/dialog/' : '/chat/dialog/';
    }, [isMobile]);



    useEffect(() => {
        const sub = liveQuery(
            () => db.table('message').where('uid').equals(uid).reverse().toArray()
        ).subscribe({
            next: rows => setMsgs(rows),
            error: console.error
        });

        return () => sub.unsubscribe();
    }, [uid]);



    const { runAsync: fnSend } = useRequest((uid, msgText) => {

        http.requestBodyJson('PUT', {
            user_id: uid,
            msg: msgText
        }).then((results) => {

            if (!results) return;

            const { code } = results;

            if (code === 200) {

                db.table('message').put({
                    uid: uid,
                    msg: msgText,
                    timestamp: getDateTimeStr(),
                    signal: 'send'
                });

            }

        });

        return 'ok';

    }, { manual: true });



    const containerRef = useRef(null);
    const wrapperRef = useRef(null);

    const [list] = useVirtualList(msgs, {
        containerTarget: containerRef,
        wrapperTarget: wrapperRef,
        itemHeight: 74,
        overscan: 5,
    });



    useEffect(() => {

        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }

    }, [msgs.length]);



    return (
        <ChatMsg>

            <ChatMsg.Meta
                title={displayName}
                left={
                    isMobile
                        ? <Icon name="chevron-left" onClick={() => navigate(f_url)} />
                        : <></>
                }
            />

            <ChatMsg.Content>

                <YBox
                    ref={containerRef}
                    scroll={true}
                    height={winHeight - 145}
                    padding={10}
                >

                    <div ref={wrapperRef}>

                        {list.map((item) => (
                            <MsgItem
                                key={item.data.id}
                                data={item.data}
                                receiveAvatar={receiveAvatarSrc}
                                sendAvatar={sendAvatarSrc}
                            />
                        ))}

                    </div>

                </YBox>

            </ChatMsg.Content>

            <ChatMsg.Send
                onSend={(newMsg) => fnSend(uid, newMsg)}
            />

        </ChatMsg>
    );
}