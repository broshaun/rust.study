import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { Outlet, useNavigate, } from 'react-router';
import { useHttpClient2, useImgApiBase } from 'hooks/http';
import { useUserDB } from 'hooks/db';
import { useWinSize } from 'hooks'
import { liveQuery } from 'dexie'
import { Divider, Icon } from 'components/flutter';
import { Friend } from 'components/chat';
import { useMutation } from '@tanstack/react-query'
import { useVirtualizer } from "@tanstack/react-virtual";
import { useListState, useLocalStorage } from '@mantine/hooks';
import { Grid, ScrollArea, Box, Paper, Group } from '@mantine/core';


export const Mian = () => {
    const navigate = useNavigate();
    const [friends, handlers] = useListState([]);
    const [afriend, setAfriend] = useState(0);
    const [account] = useLocalStorage({ key: 'savedAccount' })

    const { http } = useHttpClient2('/rpc/chat/friend/')
    // const { endpoint } = useHttpClient2('/imgs/')
    const { joinPath } = useImgApiBase('avatar')
    const { winHeight } = useWinSize()

    const { db, userId, isReady } = useUserDB(account);




    const loadFriends = (rows) => {

        const formattedData = rows.map((row) => {

            // console.log('joinPath(row.avatar_url)', joinPath(row.avatar_url))
            return {
                ...row, avatar_url: joinPath(row.avatar_url)
                // avatar_url: endpoint.join(row.avatar_url)
            }
        });
        handlers.setState(formattedData);
    };

    const openMsgWindow = useCallback((select) => {
        // console.log('select',select)
        navigate('/chat/friend/detail/', { state: { select } });
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


    useEffect(() => {
        if (!db) return;
        runGetFriend()

        const sub = liveQuery(
            () => db.table('friends').where('ask_state').equals('agree').toArray()
        ).subscribe({
            next: (rows) => loadFriends(rows),
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

        <Grid>
            <Grid.Col span={4}>
                <Paper p={0} radius={0}>
                    <ScrollArea ref={parentRef} h={winHeight} style={{ width: '100%' }}>
                        <Group justify="flex-end">
                            <Icon name='user-plus' onClick={() => { navigate('/chat/mobile/find/') }} badgeContent={afriend} />
                        </Group>
                        <Divider fade />

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
                                    return <Friend
                                        key={friend.id}
                                        data={friend}
                                        virtualRow={virtualRow}
                                        onSelect={(value) => { openMsgWindow(value) }}
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


