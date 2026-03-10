import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient } from 'hooks/http';
import { useRequest } from 'ahooks';
import { FriendList } from 'components/chat';
// import { Chat, Container, Avatar } from 'components';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie'

import { Column, Border, Divider, Container, Row, Right, Icon, Padding, ListView } from 'components/flutter';
import { Friend } from './Friend';


export const Mian = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [friends, setFriends] = useState([]);
    const { http } = useHttpClient('/api/chat/friend/')


    const openMsgWindow = useCallback((select) => {
        navigate('/chat/friend/detail/', { state: { select } });

        console.log('++++++++++++++++++')
    }, [location.pathname]);

    const { runAsync: runGetFriend } = useRequest(
        async () => {
            http.requestParams('GET', { ask_state: 'agree' }).then((results) => {
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

    console.log('friends', friends.length)

    return <Suspense fallback={<div>加载中...</div>}>
        <Row>
            <Row.Col>
                <Container height={800} >
                    <Border />
                    <Padding value={5}>
                        <Right>
                            <Icon name='magnifying-glass' />
                        </Right>
                    </Padding>
                    <Divider />
                    <ListView
                        itemCount={friends.length}
                        itemHeight={42}
                        buffer={5}
                        itemBuilder={(index) => {
                            console.log('index', index)
                            const f = friends[index];
                            return <Friend data={f} onSelect={openMsgWindow} />
                        }}
                    />

                </Container>
            </Row.Col>
            <Row.Col span={3}>
                <Outlet />
            </Row.Col>
        </Row>
    </Suspense>

}


