import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
// import { Chat, Container, DialogList, Avatar } from 'components';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';

import { Column, Border, Divider, Container, Row, Right, Icon, Padding, ListView } from 'components/flutter';
import { DialogItem } from './DialogItem';

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

    return <Suspense fallback={<div>加载中...</div>}>
        <Row>
            <Row.Col>
                <Container >
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
                            return <DialogItem data={dialog[index]} onSelect={openMsgWindow} onClear={(p) => handleClear(p)} />
                        }}
                    />
                </Container>
            </Row.Col>
            <Row.Col span={3}>
                <Outlet />
            </Row.Col>
        </Row>
    </Suspense>



}




