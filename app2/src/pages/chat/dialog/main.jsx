import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Chat, Container, DialogList, Avatar } from 'components';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';


export const Mian = () => {
    const navigate = useNavigate()
    const [dialog, setDialog] = useState([])

    useEffect(() => {
        const sub = liveQuery(
            () => db.table('friends').where('dialog').equals(1).toArray()
        ).subscribe({
            next: rows => setDialog(rows),
            error: console.error
        })
        return () => sub.unsubscribe()
    }, [])

    // 打开聊天
    const openMsgWindow = useCallback((select) => {
        if (!select?.id) return;
        db.table('friends').update(select.id, { 'signal': 'old', 'dialog': 1 }).then(() => {
            navigate('/chat/dialog/msg/', { state: { 'uid': select?.uid, 'avatar_url': select?.avatar_url } })
        })
    }, [])

    // 关闭聊天
    const handleClear = useCallback((item) => {
        if (item?.id) {
            db.table('friends').get(item.id).then((row) => {
                db.table('message').where('uid').equals(row?.uid).delete()
                db.table('friends').update(item.id, { 'signal': 'old', 'dialog': 0 })
            })
            navigate('/chat/dialog/')
        }
    }, [])

    return <Chat>
        <Chat.Left size={"30%"}>
            <Container verticalScroll={true} >
                <DialogList
                    dialogData={dialog}
                    onSelectDialog={(select) => { openMsgWindow(select) }}
                    onClear={(p) => handleClear(p)}
                    renderAvatar={(item) => <Avatar src={item.avatar_url} size={36} roundedRadius={6} variant="rounded" fit="cover" />}
                />
            </Container>
        </Chat.Left>
        <Chat.Right size={"70%"}>
            <Outlet />
        </Chat.Right>
    </Chat>



}




