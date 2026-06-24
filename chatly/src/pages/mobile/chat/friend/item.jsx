import React, { useEffect, useCallback,useState } from "react";
import { useNavigate } from 'react-router';
import { currentAppBar, currentChat, getUserDB, useDateTime } from "utils";
import { useLocalStorage } from '@mantine/hooks';
import { IconUserPlus } from "@tabler/icons-react";
import { FriendList } from "./ui/FriendList";
import { useLiveQuery } from "dexie-react-hooks";
import { afriends } from "cache/friends";



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



    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [friendList, setFriendList] = useState([])
    useEffect(() => {
        if (!userId) {
            setIsPending(false);
            setIsSuccess(false);
            return;
        };
        let isMounted = true;
        afriends.fetch(userId).catch(() => { });
        const unsubscribe = afriends.subscribe(userId, (next) => {
            if (!isMounted) return;
            setIsPending(!!next?.isPending);
            setIsSuccess(!!next?.isSuccess);
            const newData = Array.isArray(next?.data) ? next.data : [];
            setFriendList(newData);
        });
        return () => {
            isMounted = false;
            unsubscribe?.();
        }
    }, [userId]);
    const db = getUserDB(userId)



    const openMsgWindow = useCallback(async (select) => {
        const displayName = select.remark ?? select.nickname ?? select.email;
        currentChat.getState().set('friend', { id: select?.id, uid: select?.uid, displayName: displayName, avatar_url: select?.avatar_url })
        await db.table("friends_dialog").put({ id: select?.uid, displayName: displayName, timestamp: dt.getDateTimeStr() });
        await navigate('/mobile/chat/friend/detail/');
    }, [navigate, db]);

    useEffect(() => {
        // console.log('friendList',friendList)
        if (!db) return;
        if (!isSuccess) return;
        db.table("friends").bulkPut(friendList).catch(console.error);
    }, [friendList, isSuccess, db]);

    const finalFriends = useLiveQuery(async () => {
        if (!db) return;
        const friends = await db.table("friends").where("ask_state").equals("agree").toArray();

        return friends
    }, [db], []);

    // console.log('finalFriends',finalFriends)

    return (
        <FriendList
            friends={finalFriends}
            isPending={isPending}
            onItemClick={openMsgWindow}
        // onAvatarClick={openProfile}
        />


    );

}


