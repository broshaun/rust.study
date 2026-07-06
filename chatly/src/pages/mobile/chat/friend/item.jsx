import React, { useEffect, useCallback, useState } from "react";
import { useNavigate, useOutletContext } from 'react-router';
import { currentAppBar, useDateTime } from "utils";
import { IconUserExclamation, IconUser } from "@tabler/icons-react";
import { FriendList } from "./ui/FriendList";
import { useLiveQuery } from "dexie-react-hooks";
import { friend_await_message } from "cache/friend_await_message";



export const Item = () => {
    const { db, readyData } = useOutletContext();
    const dt = useDateTime();
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    const [RIcon, setRIcon] = useState(<IconUser />);
    useEffect(() => {
        setLeftPath(null)
        setTitle('好友列表');
        setRightIcon(RIcon);
        setRightPath('/mobile/chat/friend/await/');
    }, [RIcon])

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = friend_await_message.subscribe((state) => {
            if (!state.isSuccess) return;
            const isInvite = state.data.some(({ ask_state = [] }) => (ask_state?.includes("await") && !ask_state?.includes("agree")))
            if (isInvite) {
                setRIcon(<IconUserExclamation color="red" />)
            } else {
                setRIcon(<IconUser />)
            }
        })
        return () => unsubscribe?.();
    }, [])


    const openMsgWindow = useCallback(async (select) => {
        const displayName = select.remark ?? select.nickname ?? select.email;
        await db.table("friends_dialog").put({ id: select?.uid, displayName: displayName, timestamp: dt.getDateTimeStr() });
        await navigate(`/mobile/chat/friend/detail/${select?.id}`);
    }, [navigate, db]);


    const finalFriends = useLiveQuery(async () => {
        if (!db) return;
        const { data: friends = [] } = await db.cache.get('my_friends')
        return friends
    }, [db], []);

    // console.log('finalFriends++',finalFriends)

    return (
        <FriendList
            friends={finalFriends}
            onItemClick={openMsgWindow}
        // onAvatarClick={openProfile}
        />


    );

}


