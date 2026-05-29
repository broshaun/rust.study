import React, { useState, useEffect, useMemo } from "react"
import { useWinSize, currentChat, currentAppBar, useImgApiBase } from 'utils';
import { liveQuery } from 'dexie';
import { useLocalStorage } from '@mantine/hooks';
import { useOutletContext } from 'react-router';
import { ChatBox } from "./UI/ChatBox"
import { Tools } from "./tools";


export function Msg() {
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    const current = currentChat((s) => s.current);
    useEffect(() => {
        setTitle(current?.displayName)
        setLeftPath('/mobile/chat/dialog/')
        setRightPath(null)
    }, [])

    const { fnSendMsg, db } = useOutletContext();
    const { winHeight } = useWinSize();

    const receiverAvatarSrc = useMemo(() => {
        return current?.avatar_url
    }, [current?.avatar_url]);

    const [currentUser] = useLocalStorage({ key: 'current_user' })
    
    const { joinPath: joinPathAvatar } = useImgApiBase('/files/avatar/')
    const senderAvatarSrc = useMemo(() => {
        if (!currentUser?.avatar_url) return "";
        return joinPathAvatar(currentUser?.avatar_url)
    }, [currentUser?.avatar_url]);

    const [msgs, setMsgs] = useState([]);
    useEffect(() => {
        if (!db) return;
        const sub = liveQuery(
            () => db.table('message').where('uid').equals(current?.uid).toArray()
            // () => db.table('message').where('uid').equals(current?.uid).reverse().toArray()
        ).subscribe({
            next: rows => setMsgs(rows),
            error: console.error
        });
        return () => sub.unsubscribe();
    }, [current?.uid, db]);


    

    const msgTextSend = async (sendText) => {
        if (sendText) {
            await fnSendMsg({ uid: current?.uid, msgType: 'text', msgText: sendText })
        }
    }

    return <div>
        <ChatBox
            height={winHeight - 55}
            messages={msgs}
            senderAvatarSrc={senderAvatarSrc}
            receiverAvatarSrc={receiverAvatarSrc}
            onSend={(v) => { msgTextSend(v) }}
            // onOpenTools={() => { console.log("打开工具栏") }}
        >
            <ChatBox.Tools>
                <Tools />
            </ChatBox.Tools>
        </ChatBox>

    </div>


}