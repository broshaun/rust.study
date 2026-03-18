import React, { useState, useEffect, useRef, useMemo } from "react"
import { useLocation, useNavigate } from "react-router";
import { useDateTime, useWinSize } from 'hooks';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';
import { MsgItem, ChatMsg } from 'components/chat';
import { Icon, YBox } from 'components/flutter';
import { useHttpClient2, useApiBase } from 'hooks/http';
import { useLocalStorage } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import { useVirtualizer } from "@tanstack/react-virtual";



export function Msg() {

    const location = useLocation();
    const navigate = useNavigate();

    const uid = location.state?.uid;
    const displayName = location.state?.displayName;

    const [selfAvatar] = useLocalStorage({ key: 'myAvatar' });

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


    const { mutateAsync: fnSend } = useMutation(
        {
            mutationFn: async ({ uid, msgText }) => {
                http.requestBodyJson('PUT', { user_id: uid, msg: msgText })
                    .then((results) => {
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
            },
        }
    );


    const containerRef = useRef(null);
    const rowVirtualizer = useVirtualizer({
        count: msgs.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 74,
        overscan: 10,
        useFlushSync: false,
    });


    return (
        <ChatMsg theme='light'>
            <ChatMsg.Meta
                title={displayName}
                left={isMobile ? <Icon name="chevron-left" onClick={() => navigate(f_url)} /> : <></>}
            />
            <ChatMsg.Content>
                <YBox ref={containerRef} scroll={true} height={winHeight - 160} padding={10} >
                    <div style={{
                        height: rowVirtualizer.getTotalSize(),
                        position: "relative",
                        width: "100%"
                    }}>

                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const msg = msgs[virtualRow.index];
                            if (!msg) return;

                            return <MsgItem
                                key={msg.id}
                                data={msg}
                                receiveAvatar={receiveAvatarSrc}
                                sendAvatar={sendAvatarSrc}
                                virtualRow={virtualRow}
                            />
                        })}


                    </div>

                </YBox>

            </ChatMsg.Content>

            <ChatMsg.Send
                onSend={(newMsg) => fnSend({ uid, msgText: newMsg })}
            />

        </ChatMsg>
    );
}