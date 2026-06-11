import React, { useEffect, useCallback } from "react";
import { useNavigate } from 'react-router';
import { currentChat, currentAppBar, getUserDB, useDateTime } from 'utils';
import { useLocalStorage } from '@mantine/hooks';
import { DialogList } from "./ui/DialogList";
import { useLiveQuery } from "dexie-react-hooks";


export const Item = () => {
    const dt = useDateTime();
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

    const openMsgWindow = useCallback(async (select) => {
        if (!select?.id) return;
        const displayName = select.remark ?? select.nickname ?? select.email ?? select.id;
        currentChat.getState().set('friend', { id: select?.id, uid: select?.uid, displayName: displayName, avatar_url: select?.avatar_url })
        await db.table("friends_dialog").update(select?.id, { signal: 'old', timestamp: dt.getDateTimeStr() })
        await navigate('/mobile/chat/message')
    }, [navigate, db])

    // 关闭聊天
    const handleClear = (item) => {
        if (item?.id) {
            db.table("friends_dialog").where("id").equals(item?.uid).delete().catch(console.error);
            db.table('message').where('uid').equals(item?.uid).delete().catch(console.error);
            navigate('/mobile/chat/dialog')
        }
    }

    const finalDialog = useLiveQuery(async () => {
        if (!db) return;
        const dialog = await db.table("friends_dialog").toArray();
        const friends = await db.table("friends").where("ask_state").equals("agree").toArray();
        const friendMap = new Map(friends.map(item => [item.uid, item]))
        return dialog.filter(d => friendMap.has(d.id)).map(d => ({ ...d, ...friendMap.get(d.id) }))
    }, [db], []);

    return (
        <DialogList
            dialogs={finalDialog}
            onSelect={openMsgWindow}
            onClear={handleClear}
        />
    );
}
