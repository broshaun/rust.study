import React, { useEffect, useState, useMemo, useTransition, useCallback, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient } from 'hooks/http';
import { useRequest } from 'ahooks';
import { FriendList } from 'components/chat';
import { Chat, Container, Avatar } from 'components';
import { db, useIndexedDB } from 'hooks/db';




export const Item = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [friends, setFriends] = useState([]);
    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/friend/')
    const { table } = useIndexedDB(db);
    const tbdialog = useMemo(() => table('chat_dialog'), [table]);
    const openMsgWindow = useCallback((select) => {
        navigate('/chat/mobile/detail/', { state: { select } });
    }, [navigate, location.pathname]);

    const { runAsync: runGetFriend } = useRequest(
        async () => {
            const results = await http.requestParams('GET');
            if (!results) return;
            const { code, message, data } = results;
            if (code !== 200) return;
            return await tbdialog.bulkReplace(
                startTransition(() => {
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
                })
            );
        }, { manual: true })

    useEffect(() => {
        if (location.pathname.startsWith('/chat/mobile/friend')) {
            tbdialog.find()
                .then((rows) => {
                    setFriends(rows)
                    return
                }).then(() => {
                    runGetFriend()
                    return
                })
        }
    }, [location.pathname, runGetFriend, tbdialog]);


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


