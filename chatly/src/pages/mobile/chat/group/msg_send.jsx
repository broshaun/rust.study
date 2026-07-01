import React, { useState, useEffect } from "react"
import { useWinSize, currentAppBar } from 'utils';
import { ChatBox } from "./ui/ChatBox"
import { useOutletContext, useParams } from "react-router";
import { IconDots } from "@tabler/icons-react";
import { IconMoodSmile, IconPhotoUp } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";


// 变成一个纯函数，谁调用谁传 groupId 进来
const getToolsConfig = (groupId) => [
    {
        id: 'smile',
        icon: IconMoodSmile,
        label: '表情',
        path: `/mobile/chat/group/smile/${groupId}`,
        color: 'grape'
    },
    {
        id: 'imgUp',
        icon: IconPhotoUp,
        label: '发送图片',
        path: `/mobile/chat/group/imgUp/${groupId}`,
        color: 'teal'
    },
];

export function Msg() {
    const { msgSend, db } = useOutletContext();
    const { id: groupId } = useParams();
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    useEffect(() => {
        if (!db) return;
        return () => {
            if (groupId) return;
            db.table("groups_dialog").put({ id: groupId, signal: "old", unread: 0, }).catch(console.error);
        };
    }, [db, groupId]);

    useEffect(() => {
        db.table('groups').get(groupId).then((group) => {
            setTitle(group?.name)
            setLeftPath(`/mobile/chat/group/`)
            setRightIcon(<IconDots />)
            setRightPath(`/mobile/chat/group/gusr/${groupId}`)
        })
    }, [groupId])

    const { winHeight } = useWinSize();
    const msgs = useLiveQuery(async () => {
        if (!db) return;
        const msg = await db.table('gmsgs').where('group_id').equals(groupId).toArray()
        return msg
    }, [db, groupId], [])

    const msgTextSend = async (sendText) => {
        if (sendText) {
            await msgSend({ group_id: groupId, msgType: 'text', msgText: sendText })
        }
    }

    return <div>
        <ChatBox
            tools={getToolsConfig(groupId)}
            height={winHeight - 55}
            messages={msgs}
            onSend={(v) => { msgTextSend(v) }}
        />
    </div>


}