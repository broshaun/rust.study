import React, { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient2 } from 'hooks/http';
import { useRequest, useVirtualList } from 'ahooks';
import { db } from 'hooks/db';
import { useWinSize } from 'hooks'
import { liveQuery } from 'dexie'
import { Divider, Icon, YBox, XBox } from 'components/flutter';
import { Friend } from 'components/chat';


export const Mian = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [friends, setFriends] = useState([]);
    const { http } = useHttpClient2('/rpc/chat/friend/')
    const { winHeight, isMobile } = useWinSize()


    const openMsgWindow = useCallback((select) => {
        navigate('/chat/friend/detail/', { state: { select } });
    }, [location.pathname]);

    const { runAsync: runGetFriend } = useRequest(
        async () => {
            http.requestBodyJson('GET', { ask_state: 'agree' }).then((results) => {
                if (!results) return 0;
                const { code, message, data } = results;
                if (code !== 200) return 0;
                const list = data?.detail || []
                list.forEach(element => {
                    db.table('friends').get(element?.id).then((row) => {
                        if (row) {
                            db.table('friends').update(row?.id, {
                                'uid': element?.user_id,
                                'avatar_url': element?.avatar_url,
                                'email': element?.email,
                                'remark': element?.remark,
                                'nikename': element?.nikename
                            })
                        } else {
                            db.table('friends').put({
                                'id': element?.id,
                                'uid': element?.user_id,
                                'avatar_url': element?.avatar_url,
                                'email': element?.email,
                                'remark': element?.remark,
                                'nikename': element?.nikename,
                                'signal': 'old',
                                'dialog': 0
                            })
                        }
                    })
                });
                return 1;
            })
        }, { manual: true }
    )

    useEffect(() => {
        runGetFriend()
        const sub = liveQuery(
            () => db.table('friends').toArray()
        ).subscribe({
            next: rows => setFriends(rows),
            error: console.error
        })
        return () => sub.unsubscribe()
    }, [])


    const containerRef = useRef(null);
    const wrapperRef = useRef(null)
    const [list] = useVirtualList(friends, {
        containerTarget: containerRef,
        wrapperTarget: wrapperRef,
        itemHeight: 74,
        overscan: 10,
    });


    return <Suspense fallback={<div>加载中...</div>}>

        <XBox panel border padding={12} gap={8} radius={24}>

            <XBox.Segment divider>

                <YBox ref={containerRef} scroll={true} height={winHeight - 24}>
                    <YBox.Segment height={36} width="100%" align="right" justify="middle" padding={10}>
                        <Icon name='magnifying-glass' onClick={() => { navigate('/chat/mobile/find/') }} />
                    </YBox.Segment>
                    <Divider fade/>
                    <div ref={wrapperRef}>
                        {list.map((item) => {
                            // console.log('item',item)
                            return <Friend
                                key={item.data.id}
                                data={item.data}
                                onSelect={(value) => openMsgWindow(value)}
                            />
                        })}
                    </div>
                </YBox>

            </XBox.Segment>

            <XBox.Segment span={3} divider>
                <Outlet />
            </XBox.Segment>
        </XBox>
    </Suspense>

}


