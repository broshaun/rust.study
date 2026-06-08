import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate } from 'react-router';
import { liveQuery } from 'dexie';
import { currentChat, currentAppBar, getUserDB } from 'utils';
import { useLocalStorage } from '@mantine/hooks';
import { DialogList } from "./UI/DialogList";
import { useQueryClient } from "@tanstack/react-query";

export const Item = () => {
    const navigate = useNavigate()

    const [userId] = useLocalStorage({ key: 'current_account' })
    const db = getUserDB(userId);


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
        db.table("dialog").update(select?.id, { signal: 'old' })
        navigate('/mobile/chat/message')
    }, [navigate, db])

    // 关闭聊天
    const handleClear = useCallback((item) => {
        console.log('item', item)

        if (item?.id) {
            console.log('item', item)
            db.table("dialog").where("id").equals(item?.id).delete()
            db.table('message').where('uid').equals(item?.uid).delete()
            navigate('/mobile/chat/dialog')
        }
    }, [db])


    const [friendMap, setFriendMap] = useState(() => new Map());
    const queryClient = useQueryClient();
    const friendList = queryClient.getQueryData(["my_friends", userId]);

    useEffect(() => {
        if (!friendList) return;
        setFriendMap(new Map(friendList.map(item => [item.uid, item])));
    }, [friendList]);


    // console.log('friendMap',friendMap)

    const [dialogList, setDialogList] = useState([])
    useEffect(() => {
        if (!db) return;
        const sub = liveQuery(() => db.table("dialog").toArray())
            .subscribe(rows => {
                setDialogList(rows.map(item => {
                    // console.log('item',item)
                    const friend = friendMap.get(item.id);
                    return {
                        ...item,
                        "avatar_url": friend?.avatar_url,
                        "email": friend?.email,
                        "nickname": friend?.nickname,
                        "remark": friend?.remark,
                    }
                }))
            });
        return () => sub.unsubscribe();
    }, [db, friendMap]);

    // console.log('dialogList', dialogList)

    return (
        <DialogList
            dialogs={dialogList}
            onSelect={openMsgWindow}
            onClear={handleClear}
        />
    );
}
