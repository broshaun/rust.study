import React, { useState, useEffect } from "react"
import { useWinSize, currentAppBar, currentGroup } from 'utils';
import { liveQuery } from 'dexie';
import { ChatBox } from "./UI/ChatBox"
import { Tools } from "./msg_tools";
import { useOutletContext } from "react-router";
import { IconDots } from "@tabler/icons-react";


export function Msg() {
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);

    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    const current = currentGroup((s) => s.current);
    useEffect(() => {
        setTitle(current?.group_name)
        setLeftPath('/mobile/chat/group/')
        setRightIcon(<IconDots />)
        setRightPath('/mobile/chat/group/gusr/')
    }, [])

    const { winHeight } = useWinSize();
    const { db, mutation } = useOutletContext();
    const [msgs, setMsgs] = useState([]);
    useEffect(() => {
        if (!db) return;
        const sub = liveQuery(
            () => db.table('gmsgs').where('group_id').equals(current?.id).toArray()
            // () => db.table('message').where('uid').equals(current?.uid).reverse().toArray()
        ).subscribe({
            next: rows => setMsgs(rows),
            error: console.error
        });
        return () => sub.unsubscribe();
    }, [current?.id, db]);


    const msgTextSend = async (sendText) => {
        if (sendText) {
            await mutation.mutateAsync({ group_id: current?.id, msgType: 'text', msgText: sendText })
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