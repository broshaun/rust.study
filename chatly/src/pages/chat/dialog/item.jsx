import React, { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Padding ,Background} from 'components/flutter';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';
import { DialogItem } from 'components/chat';
import { useVirtualList } from 'ahooks';
import { useWinSize } from 'hooks';


export const Item = () => {
    const navigate = useNavigate()
    const [dialog, setDialog] = useState([])
    const { winHeight, isMobile } = useWinSize()

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
        const displayName = select.remark ?? select.nikename ?? select.email ?? select.id;
        db.table('friends').update(select.id, { 'signal': 'old', 'dialog': 1 }).then(() => {
            navigate('/message/', { state: { 'uid': select?.uid, 'avatar_url': select?.avatar_url, 'displayName': displayName } })
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


    const containerRef = useRef(null);
    const wrapperRef = useRef(null)
    const [list] = useVirtualList(dialog, {
        containerTarget: containerRef,
        wrapperTarget: wrapperRef,
        itemHeight: 74,
        overscan: 10,
    });


    return <Suspense fallback={<div>加载中...</div>}>
        <Background/>
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
    </Suspense>
}
