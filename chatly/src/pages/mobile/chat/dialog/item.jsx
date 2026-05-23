import React, { useEffect, useCallback, Suspense, useRef } from "react";
import { useNavigate } from 'react-router';
import { getUserDB, useImgApiBase } from "utils";
import { liveQuery } from 'dexie';
import { useWinSize, currentChat, currentAppBar } from 'utils';
import { useListState, useLocalStorage } from '@mantine/hooks';
import { ScrollArea, Box } from '@mantine/core';
import { DialogItem } from "./UI/DialogItem";


export const Item = () => {
    const navigate = useNavigate()
    const [dialog, handlers] = useListState([]);
    const [account] = useLocalStorage({ key: 'savedAccount' })
    const { joinPath } = useImgApiBase('/avatar/')
    const { winHeight } = useWinSize()
    const db = getUserDB(account);

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

    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    useEffect(() => {
        setLeftPath(null);
        setTitle('消息列表');
        setRightPath(null);
    }, [])

    // 打开聊天
    const setCurrent = currentChat((s) => s.setCurrent);
    const openMsgWindow = useCallback((select) => {
        if (!select?.id) return;

        const displayName = select.remark ?? select.nikename ?? select.email ?? select.id;

        setCurrent({ 'uid': select?.uid, 'avatar_url': select?.avatar_url, 'displayName': displayName })

        db.table('friends').update(select.id, { 'signal': 'old', 'dialog': 1 }).then(() => {
            navigate('/mobile/chat/message')
        })
    }, [navigate, db])

    // 关闭聊天
    const handleClear = useCallback((item) => {
        if (item?.id) {
            db.table('friends').get(item.id).then((row) => {
                db.table('message').where('uid').equals(row?.uid).delete()
                db.table('friends').update(item.id, { 'signal': 'old', 'dialog': 0 })
            })
            navigate('/mobile/chat/dialog')
        }
    }, [db])


    return (
        <Suspense fallback={<div>加载中...</div>}>
            <ScrollArea
                w="100%"
                scrollbars="y"
                type="never"
                style={{ overflowX: "hidden" }}
            >
                <Box px={12}>
                    {dialog.map((dg) => (
                        <DialogItem
                            key={dg.id}
                            data={dg}
                            onSelect={openMsgWindow}
                            onClear={handleClear}
                        />
                    ))}
                </Box>
            </ScrollArea>
        </Suspense>
    );
}
