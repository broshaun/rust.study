import React, { useEffect } from "react"
import { useWinSize, currentChat, currentAppBar, getUserDB, useDateTime } from 'utils';
import { useOutletContext } from 'react-router';
import { ChatBox } from "./ui/ChatBox"
import { Tools } from "./tools";
import { useLocalStorage } from "@mantine/hooks";
import { useLiveQuery } from "dexie-react-hooks";


export function Msg() {
    const dt = useDateTime();
    const [userId] = useLocalStorage({ key: 'current_account' })
    const db = getUserDB(userId)
    const current = currentChat((state) => state.current.get("friend"));

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
            db.table("friends_dialog").update(current?.uid, {
                signal: "old",
                unread: 0,
                timestamp: dt.getDateTimeStr(),
            }).catch(console.error);
        };
    }, [db, current]);


    const msgs = useLiveQuery(async () => {
        return await db.table('message').where('uid').equals(current?.uid).toArray()
    }, [db], [])



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