import React, { useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from 'react-router';
import { currentAppBar, useDateTime } from 'utils';
import { DialogList } from "./ui/DialogList";
import { useLiveQuery } from "dexie-react-hooks";


export const Item = () => {
    const { db, readyData } = useOutletContext();
    const dt = useDateTime();
    const navigate = useNavigate()

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
        await db.table("friends_dialog").update(select?.id, { signal: 'old', timestamp: dt.getDateTimeStr() })
        // console.log('select?.id',select?.id)
        await navigate(`/mobile/chat/message/${select?.id}`)
    }, [navigate, db])

    // 关闭聊天
    const handleClear = async (item) => {
        if (item?.id) {
            await db.table("friends_dialog").where("id").equals(item?.uid).delete();
            await db.table('message').where('uid').equals(item?.uid).delete();
            await navigate('/mobile/chat/dialog')
        }
    }

    const finalDialog = useLiveQuery(async () => {
        if (!db) return;
        const dialog = await db.table("friends_dialog").toArray();
        const { data: friends = [] } = await db.cache.get('my_friends');
        const friendMap = new Map(friends.map(item => [item.uid, item]))
        const a = dialog.filter(d => friendMap.has(d.id)).map(d => ({ ...d, ...friendMap.get(d.id) }));
        return a.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [db], []);

    return (
        <DialogList
            dialogs={finalDialog}
            onSelect={openMsgWindow}
            onClear={handleClear}
        />
    );
}
