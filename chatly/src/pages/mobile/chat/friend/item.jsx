import React, { useEffect, useCallback } from "react";
import { useNavigate } from 'react-router';
import { currentAppBar, useHttpClient, currentChat, getUserDB, useDateTime } from "utils";
import { useQuery } from '@tanstack/react-query'
import { useLocalStorage } from '@mantine/hooks';
import { IconCirclePlus } from "@tabler/icons-react";
import { FriendList } from "./UI/FriendList";
import { useLiveQuery } from "dexie-react-hooks";



export const Item = () => {
    const dt = useDateTime();
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
    const get_friend = async () => {
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

    const { data: friendList, isSuccess, isPending } = useQuery({
        queryKey: ["my_friends", userId],
        queryFn: get_friend,
        staleTime: 1000 * 3600 * 1,
        gcTime: 1000 * 3600 * 12,
        enabled: !!userId,
        refetchOnWindowFocus: false,
    })
    const db = getUserDB(userId)

    const openMsgWindow = useCallback(async (select) => {
        const displayName = select.remark ?? select.nickname ?? select.email;
        currentChat.getState().set('friend', { id: select?.id, uid: select?.uid, displayName: displayName, avatar_url: select?.avatar_url })
        await db.table("friends_dialog").put({ id: select?.uid, displayName: displayName, timestamp: dt.getDateTimeStr() });
        await navigate('/mobile/chat/friend/detail/');
    }, [navigate, db]);

    useEffect(() => {
        if (!db) return;
        if (!isSuccess) return;
        db.table("friends").bulkPut(friendList).catch(console.error);
    }, [friendList, isSuccess, db]);

    const finalFriends = useLiveQuery(async () => {
        if (!db) return;
        const friends = await db.table("friends").where("is_delete").equals(0).toArray();
        return friends
    }, [db], []);

    return (
        <FriendList
            friends={finalFriends}
            isPending={isPending}
            onItemClick={openMsgWindow}
        // onAvatarClick={openProfile}
        />


    );

}


