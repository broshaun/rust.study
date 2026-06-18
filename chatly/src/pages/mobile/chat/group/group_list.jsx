import { currentAppBar, currentChat, getUserDB, useDateTime } from "utils";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useLocalStorage } from '@mantine/hooks';
import { IconUserShare } from "@tabler/icons-react";
import { GroupList } from "./ui/GroupList";
import { useLiveQuery } from "dexie-react-hooks";
import { loginCache } from "cache/loginCache";
import { agroups } from "cache/groups";
import { useQueryCache } from "cache";



export const Item = () => {
    const dt = useDateTime();
    const [userId] = useLocalStorage({ key: 'current_account' })
    const db = getUserDB(userId);
    const usrInfo = loginCache.get(userId)

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
    const openGroup = (value) => {
        currentChat.getState().set('group', { id: value?.id, name: value?.group_name })
        db.table("groups_dialog").put({ id: value?.id, signal: 'old', timestamp: dt.getDateTimeStr() }).catch(console.error);
        navigate('/mobile/chat/group/msgs')
    }

    // 点击群头像
    const openGroupInfo = (value) => {
        const list = value?.administrator || [];
        if (list.includes(usrInfo?.id)) {
            currentChat.getState().set('group', { id: value?.id })
            navigate('/mobile/chat/group/update')
        }
    }

    const { data: groupList, isSuccess } = useQueryCache(agroups,userId);

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

    return (
        <GroupList
            groups={finalGroups}
            onSelect={openGroup}
            onAvatarClick={openGroupInfo}
        />
    );
}