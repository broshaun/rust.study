import React, { useEffect,useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useWinSize, currentAppBar, useDateTime } from "utils";
import { ChatBox } from "./ui/ChatBox";
import { IconMoodSmile, IconPhotoUp, IconPhoneOutgoing } from '@tabler/icons-react';



const TOOLS_CONFIG = [
    {
        id: 'smile',
        icon: IconMoodSmile,
        label: '表情',
        path: '/mobile/chat/message/smile',
        color: 'grape'
    },
    {
        id: 'imgUp',
        icon: IconPhotoUp,
        label: '发送图片',
        path: '/mobile/chat/message/imgUp',
        color: 'teal'
    },
    {
        id: 'call',
        icon: IconPhoneOutgoing,
        label: '发起通话',
        path: '/mobile/chat/message/caller',
        color: 'green'
    },
];



export function Msg() {
    const { fnSendMsg, db } = useOutletContext();
    const { winHeight } = useWinSize();
    const { id: friendId } = useParams();

    console.log('friendId++',friendId)

    const dt = useDateTime();

    const [current,setCurrent] = useState()
     useLiveQuery(async() => {
        const data = await db.table('friends').get(friendId)
        console.log('data++',data)
        setCurrent(data)
        // return data
    },[db,friendId]);

    console.log('current++', current)

    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightPath = currentAppBar((state) => state.setRightPath);


    useEffect(() => {
        setTitle(current?.remark || current?.nickname || current?.email);
        setLeftPath("/mobile/chat/dialog/");
        setRightPath(null);
    }, [current, setTitle, setLeftPath, setRightPath]);

    useEffect(() => {
        if (!db || !current?.uid) return;
        return () => {
            db.table("friends_dialog")
                .update(current.uid, {
                    signal: "old",
                    unread: 0,
                    timestamp: dt.getDateTimeStr(),
                }).catch(console.error);
        };
    }, [db, current?.uid]);


    const msgs = useLiveQuery(async () => {
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


    // console.log('msgs',msgs)

    return (
        <ChatBox
            messages={msgs}
            tools={TOOLS_CONFIG}
            height={winHeight - 55}
            onSend={msgTextSend}
        />
    );
}