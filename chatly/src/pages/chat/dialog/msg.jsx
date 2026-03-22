import React, { useState, useEffect, useRef, useMemo } from "react"
import { useLocation, useNavigate } from "react-router";
import { useDateTime, useWinSize } from 'hooks';
import { useUserDB } from 'hooks/db';
import { liveQuery } from 'dexie';
import { MsgItem, ChatMsg } from 'components/chat';
import { Icon } from 'components/flutter';
import { useHttpClient2 } from 'hooks/http';
import { useLocalStorage } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import { useVirtualizer } from "@tanstack/react-virtual";
import { ScrollArea, Box } from "@mantine/core";



export function Msg() {

    const location = useLocation();
    const navigate = useNavigate();

    const uid = location.state?.uid;
    const displayName = location.state?.displayName;

    const [account] = useLocalStorage({ key: 'savedAccount' })
    const [selfAvatar] = useLocalStorage({ key: 'myAvatar' });
    const [msgs, setMsgs] = useState([]);

    const { endpoint } = useHttpClient2('/imgs/')
    const { db, userId, isReady } = useUserDB(account);

    const receiveAvatarSrc = useMemo(() => {
        return location.state?.avatar_url
    }, [location.state?.avatar_url]);

    const sendAvatarSrc = useMemo(() => {
        if (!selfAvatar) return "";

        return endpoint.join(selfAvatar)
    }, [endpoint, selfAvatar]);


    const { http } = useHttpClient2('/rpc/chat/msg/single/');
    const { getDateTimeStr } = useDateTime();
    const { winHeight, isMobile } = useWinSize();

    const f_url = useMemo(() => {
        return isMobile ? '/chat/mobile/dialog/' : '/chat/dialog/';
    }, [isMobile]);


    useEffect(() => {
        if (!db) return;
        const sub = liveQuery(
            () => db.table('message').where('uid').equals(uid).reverse().toArray()
        ).subscribe({
            next: rows => setMsgs(rows),
            error: console.error
        });

        return () => sub.unsubscribe();
    }, [uid, db]);


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

                <ScrollArea viewportRef={containerRef} h={winHeight - 128} w="100%" scrollbars="y" type="never" style={{ overflowX: 'hidden' }}>
                    <Box px={12}>
                        <Box style={{
                            height: rowVirtualizer.getTotalSize(),
                            position: "relative",
                            width: "100%",
                            boxSizing: 'border-box',
                        }}>

                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const msg = msgs[virtualRow.index];
                                if (!msg) return null;

                                return <MsgItem
                                    key={msg.id}
                                    data={msg}
                                    receiveAvatar={receiveAvatarSrc}
                                    sendAvatar={sendAvatarSrc}
                                    virtualRow={virtualRow}
                                />
                            })}

                        </Box>
                    </Box>
                </ScrollArea>

            </ChatMsg.Content>

            <ChatMsg.Send
                onSend={(newMsg) => fnSend({ uid, msgText: newMsg })}
            />

        </ChatMsg>
    );
}