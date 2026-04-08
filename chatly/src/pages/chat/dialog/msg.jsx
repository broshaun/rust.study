import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useLocation, useNavigate } from "react-router";
import { useDateTime, useWinSize } from 'hooks';
import { useUserDB } from 'hooks/db';
import { liveQuery } from 'dexie';
import { useHttpClient2, useImgApiBase } from 'hooks/http';
import { useLocalStorage } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import { useVirtualizer } from "@tanstack/react-virtual";
import { ScrollArea, Box, ActionIcon, Text, Textarea, Button } from "@mantine/core";
import { IconChevronLeft, IconPhone } from '@tabler/icons-react';
import { MsgItem, ChatMsg } from 'components/chat';
import { useNavigate, Outlet, useOutlet } from 'react-router';
import { ImageUpload } from "components/flutter";
import { IconPhoto } from '@tabler/icons-react';




export const parseMsgContent = (msg) => {
    if (typeof msg !== 'string') {
        return { type: 'text', content: '' };
    }
    if (msg.startsWith('[image]')) {
        return { type: 'image', content: msg.slice(7), };
    }
    if (msg.startsWith('[phone]')) {
        const raw = msg.slice(7).trim();
        return { type: 'phone', content: msg, json: JSON.parse(raw) };
    }
    return { type: 'text', content: msg, };
};

export function Msg() {
    const location = useLocation();
    const navigate = useNavigate();
    const outlet = useOutlet();
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
            // () => db.table('message').where('uid').equals(uid).toArray()
        ).subscribe({
            next: rows => setMsgs(rows),
            error: console.error
        });

        return () => sub.unsubscribe();
    }, [uid, db]);


    const { mutateAsync: fnSendMsg, isPending: loading } = useMutation(
        {
            mutationFn: async ({ uid, msgText }) => {



                http.requestBodyJson('PUT', { user_id: uid, msg: msgText })
                    .then((results) => {
                        if (!results) return;
                        const { code } = results;
                        if (code === 200) {
                            // console.log('results',results)

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
        estimateSize: () => 90,
        measureElement: (el) => el.getBoundingClientRect().height,
        overscan: 6,
        useFlushSync: false,
    });

    // useEffect(() => {
    //     if (!msgs.length) return;
    //     requestAnimationFrame(() => {
    //         rowVirtualizer.measure();
    //         requestAnimationFrame(() => {
    //             rowVirtualizer.scrollToIndex(msgs.length - 1, {
    //                 align: "end",
    //                 behavior: "auto",
    //             });
    //         });
    //     });
    // }, [msgs.length, rowVirtualizer]);




    const senddd = async () => {
        if (sendText) {
            await fnSendMsg({ uid, msgText: sendText })
        }
        if (uploadRef.current?.file) {
            console.log('发送图片。。。')
            const imgFile = await uploadFile(uploadRef.current.file)

            console.log('发送图片。。。', imgFile)
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
            <ScrollArea viewportRef={containerRef} h={winHeight - 200} >
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

                            // console.log('type', type)
                            // console.log('content', content)

                            return <MsgItem
                                key={msg.id}
                                avatar={msg.signal === 'send' ? sendAvatarSrc : receiveAvatarSrc}
                                timestamp={msg.timestamp}
                                position={msg.signal === 'send' ? 'right' : 'left'}
                                virtualRow={virtualRow}
                                measureElement={rowVirtualizer.measureElement}
                                msgType={type}
                                content={content}
                            />

                        })}

                    </Box>
                </Box>
            </ScrollArea>
        </ChatMsg.Content>

        <ChatMsg.Tool onClose={() => setUsable(false)} onOpen={() => { setUsable(true); navigate('/chat/dialog/msg/tools'); }} >
            <Outlet context={{ setSendText, uploadRef }} />
        </ChatMsg.Tool>

        <ChatMsg.Send button={'发送'} onClick={() => { setSendText(""); }} >

            <Textarea
                style={{ flex: 1 }}
                placeholder="请输入..."
                variant="filled"
                radius="md"
                autosize
                minRows={1}
                maxRows={1}
                value={sendText}
                onChange={(e) => { setSendText(e.currentTarget.value); setUsable((e.currentTarget.value.length > 0)); }}
            />
            <Button
                disabled={!usable}
                loading={loading}
                onClick={() => { console.log('点击发送。。。'); senddd(); }}
                radius="md"
            >
                发送
            </Button>

        </ChatMsg.Send>
    </ChatMsg>

}