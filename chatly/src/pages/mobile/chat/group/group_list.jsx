import { currentAppBar, currentChat, getUserDB, useDateTime } from "utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useLocalStorage } from '@mantine/hooks';
import { IconUserShare } from "@tabler/icons-react";
import { GroupList } from "./ui/GroupList";
import { useLiveQuery } from "dexie-react-hooks";
import { loginCache } from "cache/loginCache";
import { my_groups } from "cache/my_groups";
import { userId } from "utils/identity";


export const Item = () => {
    const dt = useDateTime();
    const db = getUserDB(userId.get());
    const usrInfo = loginCache.get()

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
        currentChat.getState().set('group', { id: value?.id, name: value?.group_name })
        db.table("groups_dialog").put({ id: value?.id, signal: 'old', timestamp: dt.getDateTimeStr() }).catch(console.error);
        await navigate('/mobile/chat/group/msgs')
    }

    // 点击群头像
    const openGroupInfo = (value) => {



        const list = value?.administrator || [];


        console.log('usrInfo?.id', usrInfo?.id)
        console.log('list', list)

        if (list.includes(usrInfo?.id)) {
            currentChat.getState().set('group', { id: value?.id })
            navigate('/mobile/chat/group/update')
        }
    }

    const [isSuccess, setIsSuccess] = useState(false);
    const [groupList, setGroupList] = useState([])
    useEffect(() => {
        if (!userId) {
            setIsSuccess(false);
            return;
        };
        let isMounted = true;
        my_groups.fetch().catch(() => { });
        const unsubscribe = my_groups.subscribe((next) => {
            if (!isMounted) return;
            setIsSuccess(!!next?.isSuccess);
            const newData = Array.isArray(next?.data) ? next.data : [];
            setGroupList(newData);
        });
        return () => {
            isMounted = false;
            unsubscribe?.();
        }
    }, [userId]);

    useEffect(() => {
        if (!db) return;
        if (!isSuccess) return;
        db.table("groups").bulkPut(groupList).catch(console.error);
    }, [groupList, isSuccess, db]);

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