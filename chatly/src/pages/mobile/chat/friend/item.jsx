import React, { useEffect, useCallback } from "react";
import { useNavigate } from 'react-router';
import { currentAppBar, currentChat, getUserDB, useDateTime } from "utils";
import { useLocalStorage } from '@mantine/hooks';
import { IconUserPlus } from "@tabler/icons-react";
import { FriendList } from "./ui/FriendList";
import { useLiveQuery } from "dexie-react-hooks";
import { afriends } from "cache/friends";
import { useQueryCache } from "cache";



export const Item = () => {
    const dt = useDateTime();

    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        setLeftPath(null)
        setTitle('好友列表');
        setRightIcon(<IconUserPlus />)
        setRightPath('/mobile/chat/friend/find/')
    }, [])


    const navigate = useNavigate();
    const [userId] = useLocalStorage({ key: 'current_account' })
    const { data: friendList, isSuccess, isPending } = useQueryCache(afriends,userId)
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
        const friends = await db.table("friends").where("ask_state").equals("agree").toArray();

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


