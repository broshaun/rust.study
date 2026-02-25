import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient } from 'hooks/http';
import { useRequest } from 'ahooks';
import { FriendList } from 'components/chat';
import { Chat, Container, Avatar } from 'components';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie'


export const Mian = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [friends, setFriends] = useState([]);
    const { http } = useHttpClient('/api/chat/friend/')


    const openMsgWindow = useCallback((select) => {
        navigate('/chat/friend/detail/', { state: { select } });
    }, [location.pathname]);

    const { runAsync: runGetFriend } = useRequest(
        async () => {
            http.requestParams('GET').then((results) => {
                if (!results) return false;
                const { code, message, data } = results;
                if (code !== 200) return false;
                db.table('friends').bulkPut(
                    (data?.detail || []).map(select => (
                        {
                            id: select?.id,
                            uid: select?.user_id,
                            avatar_url: select?.avatar_url,
                            email: select?.email,
                            remark: select?.remark,
                            nikename: select?.nikename,
                        }
                    ))
                )
                return true;
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


    return <Suspense fallback={<div>加载中...</div>}>
        {friends &&
            <Chat>
                <Chat.Left size={"30%"}>
                    <Container verticalScroll={true} >
                        <FriendList
                            data={friends}
                            onSelectFriend={openMsgWindow}
                            renderAvatar={(item) => <Avatar src={item.avatar_url} size={36} roundedRadius={6} variant="rounded" fit="cover" />}
                            onFind={() => { navigate('/chat/friend/find/') }}
                        />
                    </Container>
                </Chat.Left>
                <Chat.Right size={"70%"}>
                    <Outlet />
                </Chat.Right>
            </Chat>
        }

    </Suspense>

}


