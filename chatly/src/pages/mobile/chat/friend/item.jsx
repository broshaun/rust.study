import React, { useEffect, useCallback, useState } from "react";
import { useNavigate, useOutletContext } from 'react-router';
import { currentAppBar, currentChat, useDateTime } from "utils";
import { IconUserPlus } from "@tabler/icons-react";
import { FriendList } from "./ui/FriendList";
import { useLiveQuery } from "dexie-react-hooks";
import { friend_list } from "cache/friend_list";


export const Item = () => {
    const { db, readyData } = useOutletContext();
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
    const [isPending, setIsPending] = useState(false);
    const [friendList, setFriendList] = useState([])
    useEffect(() => {
        let isMounted = true;
        friend_list.fetch().catch(() => { });
        const unsubscribe = friend_list.subscribe((next) => {
            if (!isMounted) return;
            setIsPending(!!next?.isPending);
            if (!next?.isSuccess) return;
            setFriendList(next.data);
        });
        return () => {
            isMounted = false;
            unsubscribe?.();
        }
    }, []);

    const openMsgWindow = useCallback(async (select) => {
        const displayName = select.remark ?? select.nickname ?? select.email;
        // currentChat.getState().set('friend', { id: select?.id, uid: select?.uid, displayName: displayName, avatar_url: select?.avatar_url })
        await db.table("friends_dialog").put({ id: select?.uid, displayName: displayName, timestamp: dt.getDateTimeStr() });
        await navigate(`/mobile/chat/friend/detail/${select?.id}`);
    }, [navigate, db]);

    useEffect(() => {
        db.table("friends").bulkPut(friendList).catch(console.error);
    }, [friendList]);


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


