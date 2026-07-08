import React, { useState, useEffect } from "react"
import { useWinSize, currentAppBar,useDateTime } from 'utils';
import { ChatBox } from "./ui/ChatBox"
import { useOutletContext, useParams } from "react-router";
import { IconDots } from "@tabler/icons-react";
import { IconMoodSmile, IconPhotoUp } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { getSafeArea } from "utils";


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
    const dt = useDateTime();
    const { top, bottom } = getSafeArea()

    useEffect(() => {
        if (!db) return;
        return () => {
            if (!groupId) return;
            db.table("groups_dialog").put({ id: groupId, signal: "old", timestamp: dt.getDateTimeStr() }).catch(console.error);
        };
    }, [db, groupId]);

    const group = useLiveQuery(async () => {
        if (!db) return;
        const { data: groups = [] } = await db.cache.get('my_group_list')
        return groups.find(item => item.id === groupId);
    }, [db, groupId], [])

    useEffect(() => {
        if (Array.isArray(group) && group.length === 0) return;
        setTitle(group?.group_name)
        setLeftPath(`/mobile/chat/group/`)
        setRightIcon(<IconDots />)
        setRightPath(`/mobile/chat/group/gusr/${groupId}`)
    }, [groupId, group])

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
            height={winHeight - 55 - top - bottom}
            messages={msgs}
            onSend={(v) => { msgTextSend(v) }}
        />
    </div>


}