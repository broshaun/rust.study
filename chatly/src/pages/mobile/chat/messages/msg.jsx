import React, { useState, useEffect } from "react"
import { useWinSize, currentChat, currentAppBar, getUserDB } from 'utils';
import { liveQuery } from 'dexie';
import { useOutletContext } from 'react-router';
import { ChatBox } from "./UI/ChatBox"
import { Tools } from "./tools";
import { useLocalStorage } from "@mantine/hooks";

export function Msg() {

    const [userId] = useLocalStorage({ key: 'current_account' })
    const db = getUserDB(userId)
    const current = currentChat((state) => state.current.get("friend"));
    console.log('current', current)

    const { fnSendMsg } = useOutletContext();
    const { winHeight } = useWinSize();
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    useEffect(() => {
        setTitle(current?.displayName)
        setLeftPath('/mobile/chat/dialog/')
        setRightPath(null)
    }, [])


    useEffect(() => {
        if (!db) return;
        return () => {
            if (!current?.id) return;
            db.table("dialog").update(current?.uid, {
                signal: "old",
                unread: 0,
            }).catch(console.error);
        };
    }, [db, current]);


    const [msgs, setMsgs] = useState([]);
    useEffect(() => {
        if (!db) return;
        const sub = liveQuery(
            () => db.table('message').where('uid').equals(current?.uid).toArray()
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
            onSend={(v) => { msgTextSend(v) }}
            onOpenTools={() => { console.log("打开工具栏") }}
        >
            <ChatBox.Tools>
                <Tools />
            </ChatBox.Tools>
        </ChatBox>

    </div>


}