import React, { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useNavigate } from 'react-router';
import { useHttpClient2, useImgApiBase } from 'hooks/http';
import { useWinSize } from 'hooks';
import { useUserDB } from 'hooks/db';
import { liveQuery } from 'dexie';
import { Divider } from 'components/flutter';
import { Friend } from 'components/chat';
import { useMutation } from '@tanstack/react-query'
import { useVirtualizer } from "@tanstack/react-virtual";
import { useListState, useLocalStorage } from '@mantine/hooks';
import { Group, ScrollArea, Box, Indicator, ActionIcon } from '@mantine/core';
import { useAppBar } from "components";
import { IconUserSearch } from "@tabler/icons-react";


export const Item = () => {
    const navigate = useNavigate();
    const [friends, handlers] = useListState([]);
    const [afriend, setAfriend] = useState(0);
    const [account] = useLocalStorage({ key: 'savedAccount' })

    const { http } = useHttpClient2('/rpc/chat/friend/')
    const { joinPath } = useImgApiBase('avatar')
    const { winHeight } = useWinSize()
    const { db, userId, isReady } = useUserDB(account);



    const loadFriends = (rows) => {
        const formattedData = rows.map((row) => ({
            ...row, avatar_url: joinPath(row.avatar_url)
        }));
        handlers.setState(formattedData);
    };

    const openMsgWindow = useCallback((select) => {
        navigate('/chat/mobile/detail/', { state: { select } });
    }, [navigate]);

    const { mutateAsync: runGetFriend } = useMutation(
        {
            mutationFn: async () => {
                const results = await http.requestBodyJson("GET");
                if (!results) throw new Error("获取失败");
                const { code, data, message } = results;
                if (code !== 200) throw new Error(message);
                return data;
            },
            onSuccess: (data) => {
                const list = data?.detail || []
                list.forEach(element => {
                    db.table('friends').get(element?.id).then((row) => {
                        if (row) {
                            db.table('friends').update(row?.id, {
                                'uid': element?.user_id,
                                'avatar_url': element?.avatar_url,
                                'email': element?.email,
                                'remark': element?.remark,
                                'nikename': element?.nikename,
                                'ask_state': element?.ask_state,
                            })
                        } else {
                            db.table('friends').put({
                                'id': element?.id,
                                'uid': element?.user_id,
                                'avatar_url': element?.avatar_url,
                                'email': element?.email,
                                'remark': element?.remark,
                                'nikename': element?.nikename,
                                'ask_state': element?.ask_state,
                                'signal': 'old',
                                'dialog': 0,
                            })
                        }
                    })
                });
            },
            onError: (error) => {
                console.log(error?.message);
            },
        }
    );


    const setLeftPath = useAppBar((state) => state.setLeftPath);
    const setTitle = useAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath(null)
        setTitle('好友列表');
    }, [])

    useEffect(() => {
        if (!db) return;
        runGetFriend()

        const sub = liveQuery(
            () => db.table('friends').where('ask_state').equals('agree').toArray()
        ).subscribe({
            next: rows => loadFriends(rows),
            error: console.error
        })

        const sub2 = liveQuery(
            () => db.table('friends').where('ask_state').equals('await').count()
        ).subscribe({
            next: count => setAfriend(count),
            error: console.error
        })

        return () => {
            sub.unsubscribe()
            sub2.unsubscribe()
        }
    }, [db])


    const parentRef = useRef(null);
    const rowVirtualizer = useVirtualizer({
        count: friends.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50,
        overscan: 5,
        useFlushSync: false,
    });


    return <Suspense fallback={<div>加载中...</div>}>
        <Group justify="flex-end" p={3}>
            <Indicator color="red" dot size={5} offset={5} disabled={!afriend}>
                <ActionIcon variant="transparent" c="gray.6" color="gray" onClick={() => { navigate('/chat/mobile/find/') }}>
                    <IconUserSearch size={20} />
                </ActionIcon>
            </Indicator>
        </Group>

        <Divider spacing={5} fade />

        <ScrollArea viewportRef={parentRef} h={winHeight - 26} style={{ width: '100%' }}>
            <Box px={12}>
                <Box style={{
                    height: rowVirtualizer.getTotalSize(),
                    position: "relative",
                    width: "100%",
                    boxSizing: 'border-box',
                }}>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const friend = friends[virtualRow.index];
                        if (!friend) return;
                        return <Friend key={friend.id} data={friend} virtualRow={virtualRow} onSelect={(value) => { openMsgWindow(value) }} />
                    })}
                </Box>
            </Box>
        </ScrollArea>
    </Suspense >

}


