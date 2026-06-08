import React, { useState, useEffect } from "react"
import { useWinSize, currentAppBar, currentChat, getUserDB } from 'utils';
import { liveQuery } from 'dexie';
import { ChatBox } from "./UI/ChatBox"
import { Tools } from "./msg_tools";
import { useOutletContext } from "react-router";
import { IconDots } from "@tabler/icons-react";
import { useLocalStorage } from "@mantine/hooks";


export function Msg() {
    const group = currentChat((state) => state.current.get("group"));
    const [userId] = useLocalStorage({ key: 'current_account' })
    const db = getUserDB(userId)




    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    useEffect(() => {
        console.log('db', db)
        console.log('group', group)
        if (!db) return;
        return () => {
            if (!group?.id) return;
            db.table("groups").update(group?.id, {
                signal: "old",
                unread: 0,
            }).catch(console.error);
        };
    }, [db, group]);

    useEffect(() => {
        setTitle(group?.name)
        setLeftPath('/mobile/chat/group/')
        setRightIcon(<IconDots />)
        setRightPath('/mobile/chat/group/gusr/')
    }, [group])

    const { winHeight } = useWinSize();
    const { mutation } = useOutletContext();
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