import React, { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useNavigate } from 'react-router';
import { useHttpClient2 } from 'hooks/http';
import { useWinSize } from 'hooks';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';
import { Divider, Icon, YBox } from 'components/flutter';
import { Friend } from 'components/chat';
import { useMutation } from '@tanstack/react-query'
import { useVirtualizer } from "@tanstack/react-virtual";

export const Item = () => {
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [afriend, setAfriend] = useState(0);
    const { http } = useHttpClient2('/rpc/chat/friend/')
    const { winHeight } = useWinSize()



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

    useEffect(() => {
        runGetFriend()

        const sub = liveQuery(
            () => db.table('friends').where('ask_state').equals('agree').toArray()
        ).subscribe({
            next: rows => setFriends(rows),
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
    }, [])


    const parentRef = useRef(null);
    const rowVirtualizer = useVirtualizer({
        count: friends.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50,
        overscan: 5,
        useFlushSync: false,
    });


    return <Suspense fallback={<div>加载中...</div>}>
        <YBox ref={parentRef} scroll={true} height={winHeight - 30} padding={10} >
            <Icon name='user-plus' onClick={() => { navigate('/chat/mobile/find/') }} badgeContent={afriend} />
            <Divider fade spacing={8} />

            <div style={{
                height: rowVirtualizer.getTotalSize(),
                position: "relative",
                width: "100%"
            }}>

                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const friend = friends[virtualRow.index];
                    if (!friend) return;
                    return <Friend key={friend.id} data={friend} virtualRow={virtualRow} onSelect={(value) => { openMsgWindow(value) }} />
                })}
            </div>
        </YBox>
    </Suspense>

}


