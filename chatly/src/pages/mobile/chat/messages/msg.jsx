import React, { useState, useEffect, useRef, useMemo } from "react"
import { useWinSize, currentChat, currentAppBar, useImgApiBase, useHttpClient } from 'utils';
import { liveQuery } from 'dexie';
import { useLocalStorage } from '@mantine/hooks';
import { useNavigate, useOutletContext } from 'react-router';
import { ChatBox } from "./UI/ChatBox"
import { Tools } from "./tools";



export function Msg() {
    const navigate = useNavigate();
    const [myAvatar] = useLocalStorage({ key: 'myAvatar' });
    const { fnSendMsg, joinPathAvatar, db } = useOutletContext();
    const { winHeight } = useWinSize();

    // const setTitle = currentAppBar((state) => state.setTitle);
    // const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const current = currentChat((s) => s.current);
    // useEffect(() => {
    //     // console.log('current', current)
    //     setTitle(current?.displayName)
    //     setLeftPath('/mobile/chat/dialog/')
    // }, [current])




    const [msgs, setMsgs] = useState([]);
    // const [usable, setUsable] = useState(false)
    const receiverAvatarSrc = useMemo(() => {
        return current?.avatar_url
    }, [current?.avatar_url]);

    const senderAvatarSrc = useMemo(() => {
        if (!myAvatar) return "";
        return joinPathAvatar(myAvatar)
    }, [myAvatar]);



    useEffect(() => {
        if (!db) return;
        const sub = liveQuery(
            () => db.table('message').where('uid').equals(current?.uid).reverse().toArray()
            // () => db.table('message').where('uid').equals(uid).toArray()
        ).subscribe({
            next: rows => setMsgs(rows),
            error: console.error
        });

        return () => sub.unsubscribe();
    }, [current?.uid, db]);




    // const { http: httpFiles30 } = useHttpClient('/files/img30/');
    // const { joinPath: img30path } = useImgApiBase('/img30/')
    // /**
    //  * 上传缓存30天图片
    //  */
    // const uploadFile = useCallback(async (file) => {
    //     if (!file) return;
    //     const { code, data } = await httpFiles30.uploadFiles(file);
    //     if (code === 200 && data) {
    //         return data;
    //     }
    //     return;
    // }, [httpFiles30]);



    const msgTextSend = async (sendText) => {
        if (sendText) {
            await fnSendMsg({ uid: current?.uid, msgType:'text', msgText: sendText })
        }
    }


    return <div>
        <ChatBox
            height={winHeight - 55}
            messages={msgs}
            senderAvatarSrc={senderAvatarSrc}
            receiverAvatarSrc={receiverAvatarSrc}
            onSend={(v) => { msgTextSend(v) }}
            onOpenTools={() => { console.log("打开工具栏") }}
        >
            <ChatBox.Tools>
                <Tools/>
                {/* <ActionIcon variant="subtle" color="gray" title="通话测试" onClick={() => { navigate('/mobile/chat/message/test') }}>
                    <IconFlask />
                </ActionIcon>

                <ActionIcon variant="subtle" color="gray" title="发起通话" onClick={() => { navigate('/mobile/chat/message/caller') }}>
                    <IconPhoneOutgoing />
                </ActionIcon>

                <ActionIcon variant="subtle" color="gray" title="接收通话" onClick={() => { navigate('/mobile/chat/message/receiver') }}>
                    <IconPhoneIncoming />
                </ActionIcon> */}
            </ChatBox.Tools>
        </ChatBox>

    </div>


}