import React, { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { db } from 'hooks/db';
import { useWinSize } from 'hooks';
import { liveQuery } from 'dexie';
import { useVirtualList } from 'ahooks';
import {  Divider, Container, Row, Right, Icon, Padding } from 'components/flutter';
import { DialogItem } from 'components/chat';

export const Mian = () => {
    const navigate = useNavigate()
    const { winHeight, isMobile } = useWinSize()
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
        const displayName = select.remark ?? select.nikename ?? select.email ?? select.id;
        db.table('friends').update(select.id, { 'signal': 'old', 'dialog': 1 }).then(() => {
            navigate('/chat/dialog/msg/', { state: { 'uid': select?.uid, 'avatar_url': select?.avatar_url, 'displayName': displayName } })
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


    const containerRef = useRef(null);
    const wrapperRef = useRef(null)
    const [list] = useVirtualList(dialog, {
        containerTarget: containerRef,
        wrapperTarget: wrapperRef,
        itemHeight: 74,
        overscan: 10,
    });


    return <Suspense fallback={<div>加载中...</div>}>
        <Row>
            <Row.Col span={2}>
                <Container verticalScroll={true} ref={containerRef} height={winHeight}>
                    {/* <Padding value={5}>
                        <Right>
                            <Icon name='magnifying-glass' />
                        </Right>
                    </Padding>
                    <Divider /> */}
                    <Padding value={5}>
                        <div ref={wrapperRef}>
                            {list.map((item) => {
                                return <DialogItem
                                    data={item.data}
                                    onSelect={openMsgWindow}
                                    onClear={(p) => handleClear(p)}
                                />
                            })}
                        </div>
                    </Padding>
                </Container>
            </Row.Col>
            <Row.Col span={4}>
                <Outlet />
            </Row.Col>
        </Row>
    </Suspense>



}




