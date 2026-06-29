import React, { useState, useEffect, useMemo } from "react"
import { useWinSize, currentAppBar, currentChat, getUserDB, useReady } from 'utils';
import { liveQuery } from 'dexie';
import { ChatBox } from "./ui/ChatBox"
import { useOutletContext } from "react-router";
import { IconDots } from "@tabler/icons-react";
import { useLocalStorage } from "@mantine/hooks";
import { IconMoodSmile, IconPhotoUp } from "@tabler/icons-react";
import { userId } from "utils/identity";


const TOOLS_CONFIG = [
    {
        id: 'smile',
        icon: IconMoodSmile,
        label: '表情',
        path: '/mobile/chat/group/smile',
        color: 'grape'
    },
    {
        id: 'imgUp',
        icon: IconPhotoUp,
        label: '发送图片',
        path: '/mobile/chat/group/imgUp',
        color: 'teal'
    },

];

export function Msg() {
    const group = currentChat((state) => state.current.get("group"));
    const { ready, data: readyData } = useReady(() => {
        const uid = userId.get();
        if (uid) {
            return { uid };
        }
        return null;
    }, []);

    const db = useMemo(() => {
        if (!ready) return;
        return getUserDB(readyData?.uid);
    }, [ready])

    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    useEffect(() => {
        if (!db) return;
        return () => {
            if (!group?.id) return;
            db.table("groups_dialog").put({ id: group?.id, signal: "old", unread: 0, }).catch(console.error);
        };
    }, [db, group]);

    useEffect(() => {
        setTitle(group?.name)
        setLeftPath('/mobile/chat/group/')
        setRightIcon(<IconDots />)
        setRightPath('/mobile/chat/group/gusr/')
    }, [group])

    const { winHeight } = useWinSize();
    const { msgSend } = useOutletContext();
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
            await msgSend({ group_id: group?.id, msgType: 'text', msgText: sendText })
        }
    }

    return <div>
        <ChatBox
            tools={TOOLS_CONFIG}
            height={winHeight - 55}
            messages={msgs}
            onSend={(v) => { msgTextSend(v) }}
        />
    </div>


}