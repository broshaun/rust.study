import { currentAppBar, useDateTime } from "utils";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { IconUserShare } from "@tabler/icons-react";
import { GroupList } from "./ui/GroupList";
import { useLiveQuery } from "dexie-react-hooks";
import { group_list } from "cache/group_list";
import { loginCache } from "cache/loginCache";


// 群聊列表
export const Item = () => {
    const { db } = useOutletContext();
    const usrInfo = loginCache.get()

    const dt = useDateTime();
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    useEffect(() => {
        setTitle('群聊')
        setLeftPath(null)
        setRightIcon(<IconUserShare />)
        setRightPath('/mobile/chat/group/ingmsg/')
    }, [])

    const navigate = useNavigate();
    // 打开群聊
    const openGroup = async (value) => {
        db.table("groups_dialog").put({ id: value?.id, signal: 'old', timestamp: dt.getDateTimeStr() }).catch(console.error);
        await navigate(`/mobile/chat/group/msgs/${value?.id}`)
    }

    // 点击群头像
    const openGroupInfo = (value) => {
        const list = value?.administrator || [];
        if (list.includes(usrInfo?.id)) {
            navigate(`/mobile/chat/group/update/${value?.id}`)
        }
    }

    useEffect(() => {
        const unsubscribe = group_list.subscribe((state) => {
            if (!state.isSuccess) return;
            (async () => {
                // console.log('state++',state)
                db.table("groups").bulkPut(state.data);
            })();
        });
        return () => unsubscribe;
    }, [db]);

    const finalGroups = useLiveQuery(async () => {
        if (!db) return;
        const groups = await db.table("groups").toArray();
        const dialog = await db.table("groups_dialog").toArray()
        const groupMap = new Map(dialog.map(item => [item.id, item]))
        return groups.map(group => ({ ...group, ...groupMap.get(group.id) }))
    }, [db], []);


    // console.log('finalGroups',finalGroups)

    return (
        <GroupList
            groups={finalGroups}
            onSelect={openGroup}
            onAvatarClick={openGroupInfo}
        />
    );
}