import React, { useEffect, useState } from "react";
import { useOutletContext, useParams, useLoaderData } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useWinSize, currentAppBar, useDateTime } from "utils";
import { ChatBox } from "./ui/ChatBox";
import { IconMoodSmile, IconPhotoUp, IconPhoneOutgoing, IconMessageDots } from '@tabler/icons-react';
import { getUserDB } from "utils";
import { userId } from "utils/identity";
import { getSafeArea } from "utils";


const getToolsConfig = (friendId) => [
    {
        id: 'smile',
        icon: IconMoodSmile,
        label: '表情',
        path: `/mobile/chat/message/${friendId}/smile`,
        color: 'grape'
    },
    {
        id: 'imgUp',
        icon: IconPhotoUp,
        label: '发送图片',
        path: `/mobile/chat/message/${friendId}/imgUp`,
        color: 'teal'
    },
    {
        id: 'call',
        icon: IconPhoneOutgoing,
        label: '发起通话',
        path: `/mobile/chat/message/${friendId}/caller`,
        color: 'green'
    },
];

export async function loaderMsg({ params }) {
    const uid = userId.get();
    const db = getUserDB(uid)
    const { id: friendId } = params;
    return { db, friendId }
}

export function Msg() {
     const { top, bottom } = getSafeArea()
    const { fnSendMsg, msgFriend: current } = useOutletContext();
    const { db, friendId } = useLoaderData()
    const { winHeight } = useWinSize();
    const dt = useDateTime();
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);

    useEffect(() => {
        if (!current) return;
        setTitle(current?.remark || current?.nickname || current?.email);
        setLeftPath("/mobile/chat/dialog/");
        setRightPath(`/mobile/chat/message/${friendId}/offline/`);
        setRightIcon(<IconMessageDots />)
    }, [current, setTitle, setLeftPath, setRightPath, setRightIcon]);




    useEffect(() => {
        if (!db || !current?.uid) return;
        return () => {
            db.table("friends_dialog").update(current.uid, { signal: "old", unread: 0, timestamp: dt.getDateTimeStr() }).catch(console.error);
        };
    }, [db, current?.uid]);


    const msgs = useLiveQuery(async () => {
        if (!current?.uid) return []
        return await db
            .table("message")
            .where("uid")
            .equals(current.uid)
            .toArray();
    }, [db, current?.uid]);

    const msgTextSend = async (sendText) => {
        if (!sendText) return;
        if (!current?.uid) return;
        await fnSendMsg({
            uid: current.uid,
            msgType: "text",
            msgText: sendText,
        });
    };

    return (
        <ChatBox
            messages={msgs}
            tools={getToolsConfig(friendId)}
            height={winHeight - 55 - top - bottom}
            onSend={msgTextSend}
        />
    );
}