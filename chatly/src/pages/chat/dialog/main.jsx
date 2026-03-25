import React, { useEffect, Suspense, useCallback, useRef } from "react";
import { Outlet, useNavigate } from 'react-router';
import { useUserDB } from 'hooks/db';
import { useWinSize } from 'hooks';
import { liveQuery } from 'dexie';
import { DialogItem } from 'components/chat';
import { useVirtualizer } from "@tanstack/react-virtual";
import { useListState, useLocalStorage } from '@mantine/hooks';
import { useHttpClient2,useImgApiBase } from "hooks/http"
import { Grid, ScrollArea, Box, Paper } from '@mantine/core';


export const Mian = () => {
    const navigate = useNavigate()

    const [dialog, handlers] = useListState([]);
    const [account] = useLocalStorage({ key: 'savedAccount' })

    // const { endpoint } = useHttpClient2('/imgs/')
    const { joinPath } = useImgApiBase('/avatar/')

    const { winHeight, isMobile } = useWinSize()
    const { db, userId, isReady } = useUserDB(account);



    const loadFriends = (rows) => {
        const formattedData = rows.map((row) => ({
            ...row, avatar_url: joinPath(row.avatar_url)
            // avatar_url: endpoint.join(row.avatar_url)
        }));
        handlers.setState(formattedData);
    };


    useEffect(() => {
        if (!db) return;
        const sub = liveQuery(
            () => db.table('friends').where('dialog').equals(1).toArray()
        ).subscribe({
            next: rows => loadFriends(rows),
            error: console.error
        })
        return () => sub.unsubscribe()
    }, [db])


    // 打开聊天
    const openMsgWindow = useCallback((select) => {
        if (!select?.id) return;
        const displayName = select.remark ?? select.nikename ?? select.email ?? select.id;
        db.table('friends').update(select.id, { 'signal': 'old', 'dialog': 1 }).then(() => {
            navigate('/chat/dialog/msg/', { state: { 'uid': select?.uid, 'avatar_url': select?.avatar_url, 'displayName': displayName } })
        })
    }, [navigate, db])

    // 关闭聊天
    const handleClear = useCallback((item) => {
        if (item?.id) {
            db.table('friends').get(item.id).then((row) => {
                db.table('message').where('uid').equals(row?.uid).delete()
                db.table('friends').update(item.id, { 'signal': 'old', 'dialog': 0 })
            })
            navigate('/chat/dialog/')
        }
    }, [db])


    const containerRef = useRef(null);
    const rowVirtualizer = useVirtualizer({
        count: dialog.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 50,
        overscan: 5,
        useFlushSync: false,
    });


    return <Suspense fallback={<div>加载中...</div>}>

        <Grid>
            <Grid.Col span={4}>
                <Paper p={0} radius={0}>

                {/* <Icon name="magnifying-glass" /> */}
                {/* <Divider fade /> */}
                
                    <ScrollArea viewportRef={containerRef} h={winHeight} w="100%" scrollbars="y" type="never" style={{ overflowX: 'hidden' }}>
                        <Box px={12}>
                            <Box style={{
                                height: rowVirtualizer.getTotalSize(),
                                position: "relative",
                                width: "100%",

                            }}>
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const dg = dialog[virtualRow.index];
                                    if (!dg) return null;
                                    return <DialogItem
                                        key={dg.id}
                                        data={dg}
                                        virtualRow={virtualRow}
                                        onSelect={openMsgWindow}
                                        onClear={(p) => handleClear(p)}
                                    />
                                })}
                            </Box>
                        </Box>
                    </ScrollArea>
                </Paper>
            </Grid.Col>
            <Grid.Col span={8}>
                <Outlet />
            </Grid.Col>
        </Grid>

    </Suspense>



}




