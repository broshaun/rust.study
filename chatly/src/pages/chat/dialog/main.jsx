import React, { useEffect, Suspense, useCallback, useRef } from "react";
import { Outlet, useNavigate } from 'react-router';
import { db } from 'hooks/db';
import { useWinSize } from 'hooks';
import { liveQuery } from 'dexie';
import { YBox, XBox, Icon ,Divider} from 'components/flutter';
import { DialogItem } from 'components/chat';
import { useVirtualizer } from "@tanstack/react-virtual";
import { useListState } from '@mantine/hooks';
import { useHttpClient2 } from "hooks/http"
import { Group } from '@mantine/core';


export const Mian = () => {
    const navigate = useNavigate()

    const [dialog, handlers] = useListState([]);

    const { endpoint } = useHttpClient2('/imgs/')
    const { winHeight, isMobile } = useWinSize()



    const loadFriends = (rows) => {
        const formattedData = rows.map((row) => ({
            ...row, avatar_url: endpoint.join(row.avatar_url)
        }));
        handlers.setState(formattedData);
    };


    useEffect(() => {
        const sub = liveQuery(
            () => db.table('friends').where('dialog').equals(1).toArray()
        ).subscribe({
            next: rows => loadFriends(rows),
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
    }, [navigate])

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
    const rowVirtualizer = useVirtualizer({
        count: dialog.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 50,
        overscan: 5,
        useFlushSync: false,
    });


    return <Suspense fallback={<div>加载中...</div>}>
        <XBox panel border padding={12} gap={8}>
            <XBox.Segment>
                <YBox ref={containerRef} scroll={true} height={winHeight - 26}>
                    <Group justify="flex-end">
                        {/* <Icon name='magnifying-glass'  /> */}
                    </Group>
                    <Divider fade />
                    <div style={{
                        height: rowVirtualizer.getTotalSize(),
                        position: "relative",
                        width: "100%"
                    }}>
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const dg = dialog[virtualRow.index];
                            if (!dg) return;

                            return <DialogItem
                                key={dg.id}
                                data={dg}
                                virtualRow={virtualRow}
                                onSelect={openMsgWindow}
                                onClear={(p) => handleClear(p)}
                            />
                        })}
                    </div>
                </YBox>
            </XBox.Segment>
            <XBox.Segment span={3}>
                <Outlet />
            </XBox.Segment>
        </XBox>
    </Suspense>



}




