import React, { useState, useEffect } from "react"
import { useWinSize, currentChat, currentAppBar } from 'utils';
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
    const [currentUser] = useLocalStorage({ key: 'current_user' })
    
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


    console.log('msgs++',msgs)

    return <div>
        <ChatBox
            height={winHeight - 55}
            messages={msgs}
            senderAvatarSrc={currentUser?.avatar_url}
            receiverAvatarSrc={current?.avatar_url}
            onSend={(v) => { msgTextSend(v) }}
            onOpenTools={() => { console.log("打开工具栏") }}
        >
            <ChatBox.Tools>
                <Tools />
            </ChatBox.Tools>
        </ChatBox>

    </div>


}