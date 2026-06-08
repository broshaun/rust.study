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
    const { http } = useHttpClient('/rpc/chat/friend/')
    const getfriend = async () => {
        const results = await http.requestBodyJson("GET", { ask_state: "agree" });
        if (!results) throw new Error("获取失败");
        const { code, data, message } = results;
        console.log('results', results)
        if (code !== 200) {
            console.log(message)
            return []
        };
        return data?.detail || [];
    }

    const { data: friendList, isPending } = useQuery({
        queryKey: ["my_friends", userId],
        queryFn: getfriend,
        staleTime: 1000 * 3600 * 1,
        gcTime: 1000 * 3600 * 12,
        enabled: !!userId,
        refetchOnWindowFocus: false,
    })
    const db = getUserDB(userId)
    const openMsgWindow = useCallback(async (select) => {
        const displayName = select.remark ?? select.nickname ?? select.email;
        currentChat.getState().set('friend', { id: select?.id, uid: select?.uid, displayName: displayName, avatar_url: select?.avatar_url })
        const old = await db.table("dialog").get(select.uid);
        await db.table("dialog").put({
            ...old,
            id: select?.uid,
        });
        await navigate('/mobile/chat/friend/detail/');
    }, [navigate, db]);


    return (
        <FriendList
            friends={friendList}
            isPending={isPending}
            onItemClick={openMsgWindow}
        // onAvatarClick={openProfile}
        />


    );

}


