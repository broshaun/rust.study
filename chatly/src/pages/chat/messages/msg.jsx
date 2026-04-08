import React, { useState, useEffect, useRef, useMemo } from "react"
import { useWinSize } from 'hooks';
import { liveQuery } from 'dexie';
import { useLocalStorage } from '@mantine/hooks';
import { useVirtualizer } from "@tanstack/react-virtual";
import { ScrollArea, Box, Textarea, Button } from "@mantine/core";
import { MsgItem, ChatMsg } from 'components/chat';
import { Outlet, useNavigate, useOutletContext } from 'react-router';


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
    const navigate = useNavigate();
    const [myAvatar] = useLocalStorage({ key: 'myAvatar' });
    const { fnSendMsg, loading, joinPathImg30, joinPathAvatar, uid, db } = useOutletContext();



    const [msgs, setMsgs] = useState([]);
    const [sendText, setSendText] = useState('');
    const [usable, setUsable] = useState(false)

    const receiveAvatarSrc = useMemo(() => {
        return 1
    }, []);

    const sendAvatarSrc = useMemo(() => {
        if (!myAvatar) return "";
        return joinPathAvatar(myAvatar)
    }, [myAvatar]);

    const { winHeight } = useWinSize();

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



    const containerRef = useRef(null);
    const rowVirtualizer = useVirtualizer({
        count: msgs.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 90,
        measureElement: (el) => el.getBoundingClientRect().height,
        overscan: 6,
        useFlushSync: false,
    });


    const senddd = async () => {
        if (sendText) {
            await fnSendMsg({ uid, msgText: sendText })
        }
        return 'ok'
    }

    return <ChatMsg >
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

        <ChatMsg.Tool onClose={() => setUsable(false)} onOpen={() => { setUsable(true); navigate('/chat/message/tools'); }} >
            <Outlet />
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