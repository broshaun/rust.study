import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useNavigate } from 'react-router';
import { getUserDB, currentAppBar, useHttpClient, useImgApiBase } from "utils";
import { liveQuery } from 'dexie';
import { useMutation } from '@tanstack/react-query'
import { useListState, useLocalStorage } from '@mantine/hooks';
import { Group, ScrollArea, Box, Indicator, ActionIcon } from '@mantine/core';
import { IconUserSearch, IconCirclePlus } from "@tabler/icons-react";
import { Friend } from "./UI/Friend";


export const Item = () => {
    const navigate = useNavigate();
    const [friends, handlers] = useListState([]);
    const [afriend, setAfriend] = useState(0);
    const [account] = useLocalStorage({ key: 'savedAccount' })

    const { http } = useHttpClient('/rpc/chat/friend/')
    const { joinPath } = useImgApiBase('avatar')
    const db = getUserDB(account);



    const loadFriends = (rows) => {
        const formattedData = rows.map((row) => ({
            ...row, avatar_url: joinPath(row.avatar_url)
        }));
        handlers.setState(formattedData);
    };

    const openMsgWindow = useCallback((select) => {
        navigate('/mobile/chat/friend/detail/', { state: { select } });
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
                                'uid': element?.uid,
                                'avatar_url': element?.avatar_url,
                                'email': element?.email,
                                'remark': element?.remark,
                                'nikename': element?.nikename,
                                'ask_state': element?.ask_state,
                            })
                        } else {
                            db.table('friends').put({
                                'id': element?.id,
                                'uid': element?.uid,
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


    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        setLeftPath(null)
        setTitle('好友列表');
        setRightIcon(<IconCirclePlus />)
        setRightPath('/mobile/chat/friend/find/')
    }, [])

    useEffect(() => {
        if (!db) return;
        runGetFriend()

        const sub = liveQuery(
            () => db.table('friends').where('ask_state').equals('agree').toArray()
        ).subscribe({
            next: rows => loadFriends(rows),
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




    return (
        <Suspense fallback={<div>加载中...</div>}>
            <ScrollArea style={{ width: "100%" }}>
                <Box px={12}>
                    {friends.map((friend) => (
                        <Friend
                            key={friend.id}
                            data={friend}
                            onSelect={openMsgWindow}
                        />
                    ))}
                </Box>
            </ScrollArea>
        </Suspense>
    );

}


