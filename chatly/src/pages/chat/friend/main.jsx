import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { Outlet, useNavigate, useOutlet } from 'react-router';
import { useHttpClient2, useImgApiBase } from 'hooks/http';
import { useUserDB } from 'hooks/db';
import { useWinSize } from 'hooks'
import { liveQuery } from 'dexie'
import { Divider, Icon, Right } from 'components/flutter';
import { Friend } from 'components/chat';
import { useMutation } from '@tanstack/react-query'
import { useVirtualizer } from "@tanstack/react-virtual";
import { useListState, useLocalStorage } from '@mantine/hooks';
import { Grid, ScrollArea, Box, Paper, Center, Paper } from '@mantine/core';


export const Mian = () => {
    const navigate = useNavigate();
    const outlet = useOutlet();
    const [friends, handlers] = useListState([]);
    const [afriend, setAfriend] = useState(0);
    const [account] = useLocalStorage({ key: 'savedAccount' })

    const { http } = useHttpClient2('/rpc/chat/friend/')
    const { joinPath } = useImgApiBase('avatar')
    const { winHeight } = useWinSize()
    const { db, userId, isReady } = useUserDB(account);

    const loadFriends = (rows) => {
        const formattedData = rows.map((row) => {
            return {
                ...row, avatar_url: joinPath(row.avatar_url)
            }
        });
        handlers.setState(formattedData);
    };

    const openMsgWindow = useCallback((select) => {
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


    return (

        <Grid gutter={0} >

            <Grid.Col span={4}>
                <Paper p={0} radius={5} withBorder m="md">
                    <ScrollArea ref={parentRef} h={winHeight - 34} >
                        <Right>
                            <Icon name='user-plus' onClick={() => { navigate('/chat/mobile/find/') }} badgeContent={afriend} />
                        </Right>
                        <Divider fade />

                        <Box px={12}>
                            <Box style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
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
                {outlet ? (
                    <Paper p={0} radius={5} withBorder m="md" shadow="sm">
                        <Outlet />
                    </Paper>
                ) : (
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <span style={{ color: 'var(--mantine-color-dimmed)' }}>请选择联系人</span>
                    </Box>
                )}

            </Grid.Col>
        </Grid>

    )
}


