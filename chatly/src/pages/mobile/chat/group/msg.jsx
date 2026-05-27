import React, { useState, useEffect, useMemo } from "react"
import { useWinSize, currentChat, currentAppBar, useImgApiBase, currentGroup, getUserDB } from 'utils';
import { liveQuery } from 'dexie';
import { useLocalStorage } from '@mantine/hooks';
import { ChatBox } from "./UI/ChatBox"
import { Tools } from "./tools";
import { useOutletContext } from "react-router";


export function Msg() {
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    const current = currentGroup((s) => s.current);
    useEffect(() => {
        setTitle(current?.group_name)
        setLeftPath('/mobile/chat/group/')
        setRightPath(null)
    }, [])


    

    const { winHeight } = useWinSize();

    const { mutation } = useOutletContext();

    // const receiverAvatarSrc = useMemo(() => {
    //     return current?.avatar_url
    // }, [current?.avatar_url]);

    // const [myAvatar] = useLocalStorage({ key: 'myAvatar' });
    // const { joinPath: joinPathAvatar } = useImgApiBase('/files/avatar/')
    // const senderAvatarSrc = useMemo(() => {
    //     if (!myAvatar) return "";
    //     return joinPathAvatar(myAvatar)
    // }, [myAvatar]);

     const [account] = useLocalStorage({ key: 'savedAccount' });
    const db = getUserDB(account);
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
            // senderAvatarSrc={senderAvatarSrc}
            // receiverAvatarSrc={receiverAvatarSrc}
            onSend={(v) => { msgTextSend(v) }}
            // onOpenTools={() => { console.log("打开工具栏") }}
        >
            <ChatBox.Tools>
                <Tools />
            </ChatBox.Tools>
        </ChatBox>

    </div>


}