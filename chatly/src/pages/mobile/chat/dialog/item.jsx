import React, { useEffect, useCallback ,useMemo} from "react";
import { useNavigate } from 'react-router';
import { liveQuery } from 'dexie';
import { currentChat, currentAppBar, getUserDB, friendStore } from 'utils';
import { useListState, useLocalStorage } from '@mantine/hooks';
import { DialogList } from "./UI/DialogList";
import { useQueryClient } from "@tanstack/react-query";


export const Item = () => {
    const navigate = useNavigate()
    const [dialog, handlers] = useListState([]);
    const [userId] = useLocalStorage({ key: 'current_account' })
    const db = getUserDB(userId);


    const queryClient = useQueryClient();
    const friendList = queryClient.getQueryData(["my_friends", userId]);


    const dialogFriends = useMemo(
        () => friendStore.getState().filter(f => f.dialog === 1),
        [friendStore]
    );

    const finalFriends = useMemo(() => {
        return dialogFriends
            .map(friend => ({
                ...friendList.find(item => item.id === friend.id),
                ...friend,
            }))
            .filter(friend => friend.id);
    }, [friendList, dialogFriends]);


    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    useEffect(() => {
        setLeftPath(null);
        setTitle('消息列表');
        setRightPath(null);
    }, [])

    const openMsgWindow = useCallback((select) => {
        if (!select?.id) return;
        const displayName = select.remark ?? select.nickname ?? select.email ?? select.id;
        currentChat.getState().set('friend', { id: select?.id, uid: select?.uid, displayName: displayName, avatar_url: select?.avatar_url })
        friendStore.getState().set(friend?.id, { signal: 'old', dialog: 1, })
        navigate('/mobile/chat/message')
    }, [navigate, db])

    // 关闭聊天
    const handleClear = useCallback((item) => {
        if (item?.id) {

            friendStore.getState().set(item?.id, { signal: 'old', dialog: 0 })
            console.log('item',item)
            // db.table('message').where('uid').equals(item?.uid).delete()

            navigate('/mobile/chat/dialog')
        }
    }, [db])


    return (
        <DialogList
            dialogs={finalFriends}
            onSelect={openMsgWindow}
            onClear={handleClear}
        />
    );
}
