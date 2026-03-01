import React, { useEffect, useState, useCallback, Suspense } from '.store/react@18.3.1/node_modules/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient } from 'hooks/http';
import { useRequest } from 'ahooks';
import { FriendList } from 'components/chat';
import { Chat, Container, Avatar } from 'components';
import { db } from 'hooks/db';
import { liveQuery } from 'dexie';




export const Item = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [friends, setFriends] = useState([]);
    const { http } = useHttpClient('/api/chat/friend/')
    const openMsgWindow = useCallback((select) => {
        navigate('/chat/mobile/detail/', { state: { select } });
    }, [navigate, location.pathname]);

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
                            onFind={() => { navigate('/chat/mobile/find/'); }}
                        />
                    </Container>
                </Chat.Left>
            </Chat>
        }
    </Suspense>

}


