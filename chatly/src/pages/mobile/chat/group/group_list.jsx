import { useHttpClient, currentAppBar, currentChat, getUserDB, useDateTime } from "utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useLocalStorage } from '@mantine/hooks';
import { IconUserShare } from "@tabler/icons-react";
import { GroupList } from "./UI/GroupList";
import { useLiveQuery } from "dexie-react-hooks";


export const Item = () => {
    const dt = useDateTime();
    const [userId] = useLocalStorage({ key: 'current_account' })
    const db = getUserDB(userId);

    const [currentUser] = useLocalStorage({ key: 'current_user' });
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
        if (list.includes(currentUser?.id)) {
            currentChat.getState().set('group', { id: value?.id })
            navigate('/mobile/chat/group/update')
        }
    }

    const { http } = useHttpClient('/rpc/chat/msg/group/')
    const { data: groupList, isSuccess } = useQuery({
        queryKey: ["my_group_list", userId],
        queryFn: async () => {
            const results = await http.requestBodyJson("my_group_list", {});
            if (!results) throw new Error("获取失败");
            const { code, data, message } = results;
            if (code !== 200) {
                return []
            }
            return data || [];
        },
        staleTime: 1000 * 3600 * 1,
        gcTime: 1000 * 3600 * 12,
        enabled: !!userId,
        refetchOnWindowFocus: false,
    });

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

    console.log('finalGroups',finalGroups)

    return (
        <GroupList
            groups={finalGroups}
            onSelect={openGroup}
            onAvatarClick={openGroupInfo}
        />
    );
}