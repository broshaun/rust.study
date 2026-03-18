import React, { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useHttpClient2 } from 'hooks/http';
import { useVirtualList } from 'ahooks';
import { db } from 'hooks/db';
import { useWinSize } from 'hooks'
import { liveQuery } from 'dexie'
import { Divider, Icon, YBox, XBox } from 'components/flutter';
import { Friend } from 'components/chat';
import { useMutation } from '@tanstack/react-query'
import { useVirtualizer } from "@tanstack/react-virtual";



export const Mian = () => {
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [afriend, setAfriend] = useState(0);
    const { http } = useHttpClient2('/rpc/chat/friend/')
    const { winHeight } = useWinSize()


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


    // const containerRef = useRef(null);
    // const wrapperRef = useRef(null)
    // const [list] = useVirtualList(friends, {
    //     containerTarget: containerRef,
    //     wrapperTarget: wrapperRef,
    //     itemHeight: 74,
    //     overscan: 10,
    // });


    const parentRef = useRef(null);
    const rowVirtualizer = useVirtualizer({
        count: friends.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50,
        overscan: 5,
        useFlushSync: false, // React19推荐
    });


    return <XBox panel border padding={12} gap={8} >

        <XBox.Segment divider>

            <YBox ref={parentRef} scroll={true} height={winHeight - 26} padding={10} gap={8}>
                <YBox.Segment contentAlign="right" >
                    <Icon name='user-plus' onClick={() => { navigate('/chat/mobile/find/') }} badgeContent={afriend} />
                </YBox.Segment>
                <Divider fade />

                <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative", width: "100%" }}>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        // console.log('virtualRow', virtualRow)
                        const friend = friends[virtualRow.index];
                        if (!friend) return null;
                        // console.log('friend', friend)
                        return <div key={friend.id ?? virtualRow.key}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <Friend data={friend} onSelect={(value) => { openMsgWindow(value) }} />
                        </div>
                    }

                    )}
                    {/* {list.map((item) => {
                        return <Friend
                            key={item.data.id}
                            data={item.data}
                            onSelect={(value) => { openMsgWindow(value) }}
                        />
                    })} */}
                </div>
            </YBox>

        </XBox.Segment>

        <XBox.Segment span={3} divider>
            <Outlet />
        </XBox.Segment>
    </XBox>


}


