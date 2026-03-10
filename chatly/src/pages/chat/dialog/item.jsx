import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Column, Border, Divider, Container, Row, Right, Icon, Padding, ListView } from 'components/flutter';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';
import { DialogItem } from './DialogItem';


export const Item = () => {
    const navigate = useNavigate()
    const [dialog, setDialog] = useState([])

    useEffect(() => {
        const sub = liveQuery(
            () => db.table('friends').where('dialog').equals(1).toArray()
        ).subscribe({
            next: rows => setDialog(rows),
        })
        return () => sub.unsubscribe()
    }, [])

    // 打开聊天
    const openMsgWindow = useCallback((select) => {
        if (!select?.id) return;
        db.table('friends').update(select.id, { 'signal': 'old', 'dialog': 1 }).then(() => {
            navigate('/message/', { state: { 'uid': select?.uid, 'avatar_url': select?.avatar_url } })
        })
    }, [])

    // 关闭聊天
    const handleClear = useCallback((item) => {
        if (item?.id) {
            db.table('friends').get(item.id).then((row) => {
                db.table('message').where('uid').equals(row?.uid).delete()
                db.table('friends').update(item.id, { 'signal': 'old', 'dialog': 0 })
            })
            navigate('/chat/mobile/dialog/')
        }
    }, [])


    console.log('dialog', dialog)

    return <Suspense fallback={<div>加载中...</div>}>
        <Container height={800} >
            <Border />
            <Padding value={5}>
                <Right>
                    <Icon name='magnifying-glass' />
                </Right>
            </Padding>
            <Divider />
            <ListView
                itemCount={dialog.length}
                itemHeight={42}
                buffer={5}
                itemBuilder={(index) => {
                    const f = dialog[index];
                    return <DialogItem data={f} onSelect={openMsgWindow} onClear={(p) => handleClear(p)} />
                }}
            />
        </Container>
    </Suspense>
}




