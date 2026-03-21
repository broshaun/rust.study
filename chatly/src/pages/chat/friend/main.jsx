import React, { useEffect, useState, useCallback, useRef } from "react";
import { Outlet, useNavigate, } from 'react-router';
import { useHttpClient2 } from 'hooks/http';
import { useUserDB} from 'hooks/db';
import { useWinSize } from 'hooks'
import { liveQuery } from 'dexie'
import { Divider, Icon, YBox, XBox } from 'components/flutter';
import { Friend } from 'components/chat';
import { useMutation } from '@tanstack/react-query'
import { useVirtualizer } from "@tanstack/react-virtual";
import { useListState,useLocalStorage } from '@mantine/hooks';
import { Group } from '@mantine/core';
import { Stack, ScrollArea, Box } from '@mantine/core';


export const Mian = () => {
    const navigate = useNavigate();
    const [friends, handlers] = useListState([]);
    const [afriend, setAfriend] = useState(0);
    const [account] = useLocalStorage({ key: 'savedAccount' })

    const { http } = useHttpClient2('/rpc/chat/friend/')
    const { endpoint } = useHttpClient2('/imgs/')
    const { winHeight } = useWinSize()
    
    const { db, userId, isReady } = useUserDB(account);




    const loadFriends = (rows) => {
        const formattedData = rows.map((row) => ({
            ...row, avatar_url: endpoint.join(row.avatar_url)
        }));
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


    return <XBox padding={12} gap={8} >
        <XBox.Segment>



            <YBox ref={parentRef} scroll={true} height={winHeight - 26} padding={10} gap={8}>
                {/* <ScrollArea ref={parentRef} h={winHeight - 26} style={{ width: '100%' }}> */}
                    <Group justify="flex-end">
                        <Icon name='user-plus' onClick={() => { navigate('/chat/mobile/find/') }} badgeContent={afriend} />
                    </Group>
                    <Divider fade />



                    <div style={{
                        height: rowVirtualizer.getTotalSize(),
                        position: "relative",
                        width: "100%"
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

                    </div>
                {/* </ScrollArea> */}
            </YBox>

        </XBox.Segment>

        <XBox.Segment span={3} divider>
            <Outlet />
        </XBox.Segment>
    </XBox>


}


