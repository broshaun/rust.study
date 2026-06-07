import React, { useState, useEffect, useMemo } from "react"
import { useWinSize, currentAppBar, currentChat, groupStore } from 'utils';
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


    const group = currentChat(
        (state) => state.current.get("group")
    );

    useEffect(() => {
        setTitle(group?.name)
        setLeftPath('/mobile/chat/group/')
        setRightIcon(<IconDots />)
        setRightPath('/mobile/chat/group/gusr/')
    }, [group])

    const { winHeight } = useWinSize();
    const { db, mutation } = useOutletContext();
    const [msgs, setMsgs] = useState([]);
    useEffect(() => {
        if (!db || !group) return;
        const sub = liveQuery(
            () => db.table('gmsgs').where('group_id').equals(group?.id).toArray()
        ).subscribe({
            next: rows => setMsgs(rows),
            error: console.error
        });
        return () => sub.unsubscribe();
    }, [group, db]);


    const msgTextSend = async (sendText) => {
        if (sendText) {
            if (!group?.id) return;
            await mutation.mutateAsync({ group_id: group?.id, msgType: 'text', msgText: sendText })
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