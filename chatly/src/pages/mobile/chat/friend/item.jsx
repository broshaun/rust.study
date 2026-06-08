import React, { useEffect, useCallback, useMemo, useState } from "react";
import { useNavigate } from 'react-router';
import { currentAppBar, useHttpClient, currentChat, getUserDB } from "utils";
import { useQuery } from '@tanstack/react-query'
import { useLocalStorage } from '@mantine/hooks';
import { IconCirclePlus } from "@tabler/icons-react";
import { FriendList } from "./UI/FriendList";
import { liveQuery } from "dexie";


export const Item = () => {
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


    const navigate = useNavigate();
    const [userId] = useLocalStorage({ key: 'current_account' })

    const getfriend = async () => {
        const results = await http.requestBodyJson("GET", {});
        if (!results) throw new Error("获取失败");
        const { code, data, message } = results;
        console.log('results', results)
        if (code !== 200) {
            console.log(message)
            return []
        };
        return data?.detail || [];
    }

    const { data: friendList, isSuccess } = useQuery({
        queryKey: ["my_friens", userId],
        queryFn: getfriend,
        staleTime: 0,
        gcTime: 1000 * 3600 * 12,
        enabled: !!userId,
        refetchOnWindowFocus: false,
    })


    const db = getUserDB(userId)
    const [friendMap, setFriendMap] = useState(() => new Map());
    useEffect(() => {
        if (!db) return;
        const sub = liveQuery(() => db.table("friends").where("ask_state").equals("agree").toArray())
            .subscribe(rows => setFriendMap(new Map(rows.map(item => [item.id, item]))));
        return () => sub.unsubscribe();
    }, [db]);

    const finalFriends = useMemo(() => {
        if (!isSuccess) return;
        return friendList.map(friend => ({ ...friend, ...friendMap.get(friend.id) }));
    }, [friendList, friendMap, isSuccess]);
    const openMsgWindow = useCallback(async (select) => {
        const displayName = select.remark ?? select.nickname ?? select.email ?? select.id;
        currentChat.getState().set('friend', { id: select?.id, uid: select?.uid, displayName: displayName, avatar_url: select?.avatar_url })
        const old = await db.table("dialog").get(select.id);
        await db.table("dialog").put({
            ...old,
            ...select
        });

        await navigate('/mobile/chat/friend/detail/');
    }, [navigate, db]);

    const { http } = useHttpClient('/rpc/chat/friend/')


    return (
        <FriendList
            friends={finalFriends}
            onItemClick={openMsgWindow}
        // onAvatarClick={openProfile}
        />


    );

}


