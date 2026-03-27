import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useLocation, useNavigate } from "react-router";
import { useDateTime, useWinSize } from 'hooks';
import { useUserDB } from 'hooks/db';
import { liveQuery } from 'dexie';
import { useHttpClient2, useImgApiBase } from 'hooks/http';
import { useLocalStorage } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import { useVirtualizer } from "@tanstack/react-virtual";
import { ScrollArea, Box, ActionIcon } from "@mantine/core";
import { IconChevronLeft, IconPhoto, IconPhone } from '@tabler/icons-react';
import { MsgItem, MsgImgs, ChatMsg } from 'components/chat';
import { ImageUpload } from "components/flutter";


export const parseMsgContent = (msg) => {
    if (typeof msg !== 'string') return { type: 'text', content: '' };
    if (msg.startsWith('[image]')) {
        return { type: 'image', content: msg.slice(7) };
    }
    return { type: 'text', content: msg };
};

export function Msg() {
    const location = useLocation();
    const navigate = useNavigate();
    const uid = location.state?.uid;
    const displayName = location.state?.displayName;
    const [account] = useLocalStorage({ key: 'savedAccount' })
    const [selfAvatar] = useLocalStorage({ key: 'myAvatar' });
    const [msgs, setMsgs] = useState([]);
    const [sendText, setSendText] = useState('');
    const [usable, setUsable] = useState(false)

    const uploadRef = useRef(null);



    const { http: httpFiles30 } = useHttpClient2('/files/img30/');
    const { joinPath: img30path } = useImgApiBase('/img30/')



    const { joinPath } = useImgApiBase('/avatar/')
    const { db, userId, isReady } = useUserDB(account);
    const receiveAvatarSrc = useMemo(() => {
        return location.state?.avatar_url
    }, [location.state?.avatar_url]);
    const sendAvatarSrc = useMemo(() => {
        if (!selfAvatar) return "";
        return joinPath(selfAvatar)
    }, [selfAvatar]);


    /**
     * 上传缓存30天图片
     */
    const uploadFile = useCallback(async (file) => {
        if (!file) return;
        const { code, data } = await httpFiles30.uploadFiles(file);
        if (code === 200 && data) {
            return data;
        }
        return;
    }, [httpFiles30]);


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


    const { mutateAsync: fnSendMsg } = useMutation(
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
        estimateSize: () => 75,
        overscan: 5,
        useFlushSync: false,
    });

    const senddd = async () => {
        if (sendText) {
            await fnSendMsg({ uid, msgText: sendText })
        }
        if (uploadRef.current?.file) {
            const imgFile = await uploadFile(uploadRef.current.file)
            await fnSendMsg({ uid, msgText: `[image]${img30path(imgFile)}` })
        }
        setSendText(() => "")
        uploadRef.current?.clear();
        return 'ok'
    }


    return <ChatMsg >
        <ChatMsg.Meta
            title={displayName}
            left={isMobile ? <IconChevronLeft size={22} stroke={1.5} onClick={() => navigate(f_url)} /> : <a />}
        />
        <ChatMsg.Content>
            <ScrollArea viewportRef={containerRef} h={isMobile ? winHeight - 103 : winHeight - 130} >
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
                            const { type, content } = parseMsgContent(msg?.msg);

                            if (type === 'image') {
                                if (msg.signal === 'receive') {
                                    return <MsgImgs
                                        key={msg.id}
                                        avatar={receiveAvatarSrc}
                                        imgUrl={content}
                                        timestamp={msg.timestamp}
                                        position={'left'}
                                        virtualRow={virtualRow}
                                    />
                                } else if (msg.signal === 'send') {
                                    return <MsgImgs
                                        key={msg.id}
                                        avatar={sendAvatarSrc}
                                        imgUrl={content}
                                        timestamp={msg.timestamp}
                                        position={'right'}
                                        virtualRow={virtualRow}
                                    />
                                }
                            } else if (type === 'text') {
                                if (msg.signal === 'receive') {
                                    return <MsgItem
                                        key={msg.id}
                                        avatar={receiveAvatarSrc}
                                        msg={content}
                                        timestamp={msg.timestamp}
                                        position={'left'}
                                        virtualRow={virtualRow}
                                    />
                                } else if (msg.signal === 'send') {
                                    return <MsgItem
                                        key={msg.id}
                                        avatar={sendAvatarSrc}
                                        msg={content}
                                        timestamp={msg.timestamp}
                                        position={'right'}
                                        virtualRow={virtualRow}
                                    />
                                }
                            }

                        })}

                    </Box>
                </Box>
            </ScrollArea>
        </ChatMsg.Content>

        <ChatMsg.Send button={'发送'} usable={usable} onClick={() => senddd()} >

            <ChatMsg.Tool onClose={() => { uploadRef.current?.clear(); setUsable(false); }} onOpen={() => setUsable(true)} >
                <ImageUpload ref={uploadRef} size={32} onDirtyChange={(b) => setUsable(p => b || p)}>
                    <ActionIcon variant="subtle" color="gray" title="发送图片">
                        <IconPhoto />
                    </ActionIcon>
                </ImageUpload>

                <ActionIcon variant="subtle" color="gray" title="发起通话" onClick={() => { navigate('/chat/dialog/rtc') }}>
                    <IconPhone />
                </ActionIcon>
            </ChatMsg.Tool>

            <ChatMsg.SendText onChange={(text) => { setSendText(text); if (text) { setUsable(true) } else { setUsable(false) }; }} />

        </ChatMsg.Send>
    </ChatMsg>

}