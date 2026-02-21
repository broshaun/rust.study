import React, { useEffect, useState, useMemo, useTransition, useCallback, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient } from 'hooks';
import { useRequest } from 'ahooks';
import { FriendList } from 'components/chat';
import { Chat, Container } from 'components';
import { db, useIndexedDB } from 'hooks/db';


export const Mian = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [friends, setFriends] = useState([]);
    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/friend/')
    const { http: httpImgs } = useHttpClient('/imgs');
    const { table } = useIndexedDB(db);
    const tbdialog = useMemo(() => table('chat_dialog'), [table]);

    const buildAvatarUrl = useCallback((name) => httpImgs.buildUrl(name), [httpImgs]);
    const openMsgWindow = useCallback((select) => {
        
        navigate('/chat/friend/detail/', { state: { select } });
    }, [navigate, location.pathname]);

    const { runAsync: runGetFriend, loading } = useRequest(() => {
        http.requestParams('GET').then((results) => {
            if (!results) return;
            const { code, message, data } = results
            code === 200 && startTransition(() => {
                setFriends(data)
            })
            tbdialog.bulkReplace(
                data?.detail.map(select => ({
                    id: select?.id,
                    uid: select?.user_id,
                    avatar_url: select?.avatar_url,
                    email: select?.email,
                    remark: select?.remark,
                    nikename: select?.nikename,
                }))
            ).catch(console.error);
        })
    }, { manual: true })

    useEffect(() => {
        if (location.pathname.startsWith('/chat/friend')) runGetFriend();
    }, [location.pathname, runGetFriend]);



    return <Suspense fallback={<div>加载中...</div>}>
        {friends &&
            <Chat>
                <Chat.Left size={"20%"}>
                    <Container verticalScroll={true} >
                        <FriendList
                            data={friends}
                            onSelectFriend={openMsgWindow}
                            buildAvatarUrl={buildAvatarUrl}
                        />
                    </Container>
                </Chat.Left>
                <Chat.Right size={"80%"}>
                    <Outlet />
                </Chat.Right>
            </Chat>
        }
    </Suspense>

}

