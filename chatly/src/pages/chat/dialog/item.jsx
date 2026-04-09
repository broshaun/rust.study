import React, { useEffect, useCallback, Suspense, useRef } from "react";
import { useNavigate } from 'react-router';
import { useUserDB } from 'hooks/db';
import { liveQuery } from 'dexie';
import { DialogItem } from 'components/chat';
import { useWinSize, useMsgState } from 'hooks';
import { useVirtualizer } from "@tanstack/react-virtual";
import { useListState, useLocalStorage } from '@mantine/hooks';
import { useImgApiBase } from "hooks/http"
import { ScrollArea, Box } from '@mantine/core';
import { useAppBar } from "components";


export const Item = () => {
    const navigate = useNavigate()
    const [dialog, handlers] = useListState([]);
    const [account] = useLocalStorage({ key: 'savedAccount' })
    const { joinPath } = useImgApiBase('/avatar/')
    const { winHeight } = useWinSize()
    const { db } = useUserDB(account);

    const loadFriends = (rows) => {
        const formattedData = rows.map((row) => ({
            ...row, avatar_url: joinPath(row.avatar_url)
        }));
        handlers.setState(formattedData);
    };

    useEffect(() => {
        if (!db) return;
        const sub = liveQuery(
            () => db.table('friends').where('dialog').equals(1).toArray()
        ).subscribe({
            next: rows => loadFriends(rows),
        })
        return () => sub.unsubscribe()
    }, [db])

    const setLeftPath = useAppBar((state) => state.setLeftPath);
    const setTitle = useAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath(null)
        setTitle('消息列表');
    }, [])

    // 打开聊天
    const setCurrent = useMsgState((s) => s.setCurrent);
    const openMsgWindow = useCallback((select) => {
        if (!select?.id) return;

        const displayName = select.remark ?? select.nikename ?? select.email ?? select.id;
        setCurrent({ 'uid': select?.uid, 'avatar_url': select?.avatar_url, 'displayName': displayName })

        db.table('friends').update(select.id, { 'signal': 'old', 'dialog': 1 }).then(() => {
            navigate('/chat/message')
        })
    }, [navigate, db])

    // 关闭聊天
    const handleClear = useCallback((item) => {
        if (item?.id) {
            db.table('friends').get(item.id).then((row) => {
                db.table('message').where('uid').equals(row?.uid).delete()
                db.table('friends').update(item.id, { 'signal': 'old', 'dialog': 0 })
            })
            navigate('/chat/mobile/dialog/')
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
        {/* <Icon name='magnifying-glass' /> */}
        {/* <Divider fade /> */}
        <ScrollArea viewportRef={containerRef} h={winHeight - 100} w="100%" scrollbars="y" type="never" style={{ overflowX: 'hidden' }}>
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


    </Suspense>
}
