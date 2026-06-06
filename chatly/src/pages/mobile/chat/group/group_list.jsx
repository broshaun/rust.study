import { useHttpClient, currentAppBar, currentGroup, groupStore, getUserDB, useDateTime } from "utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useLocalStorage, useListState } from '@mantine/hooks';
import { IconMailExclamation } from "@tabler/icons-react";
import { GroupList } from "./UI/GroupList";
import { liveQuery } from 'dexie';


const groups = [
    {
        id: "6a0eda8ddd4f1b65730c7953",
        group_name: "修改群名称",
        group_avatar: "群头像.jpg",
        group_notice: "群公告",
    },
];

export const Item = () => {

    const [currentUser] = useLocalStorage({ key: 'current_user' });
    const setCurGroup = currentGroup((state) => state.setCurrent);
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);

    useEffect(() => {
        setTitle('群聊')
        setLeftPath(null)
        setRightIcon(<IconMailExclamation />)
        setRightPath('/mobile/chat/group/ingmsg/')
    }, [])

    const [userId] = useLocalStorage({ key: 'current_account' })
    const { http } = useHttpClient('/rpc/chat/msg/group/')


    const { data: groupList, isSuccess } = useQuery({
        queryKey: ["my_group_list", userId],
        queryFn: async () => {
            const results = await http.requestBodyJson("my_group_list", {});
            if (!results) throw new Error("获取失败");
            console.log('results', results)
            const { code, data, message } = results;
            if (code !== 200) {
                throw new Error(message || "获取群列表失败");
            }
            console.log('results', results)
            return data || [];
        },
        staleTime: 1000 * 3600 * 1,
        gcTime: 1000 * 3600 * 12,
        enabled: !!userId,
        refetchOnWindowFocus: false,
    });
    const navigate = useNavigate();
    const openGroup = (value) => {
        setCurGroup(value)
        groupStore.set(value?.id, { signal: "old" });
        navigate('/mobile/chat/group/msgs')
    }

    const openGroupInfo = (value) => {
        const list = value?.administrator || [];
        if (list.includes(currentUser?.id)) {
            setCurGroup(value)
            navigate('/mobile/chat/group/update')
        }
    }


    const [groupState, groupHandlers] = useListState([]);
    const dt = useDateTime();
    const db = getUserDB(userId);

    useEffect(() => {
        if (!isSuccess) return;

        async function asyncDB() {
            const table = db.table("groups");
            const groups = await table.toArray();
            const groupMap = Object.fromEntries(
                groups.map(item => [item.id, item])
            );

            const data = [];
            for (const item of groupList) {
                let local = groupMap[item.id];
                if (!local) {
                    local = {
                        id: item.id,
                        signal: "old",
                        timestamp: dt.getDateTimeStr(),
                    };
                    await table.put(local);
                }
                data.push({
                    ...item,
                    signal: local.signal,
                    timestamp: local.timestamp,
                });
            }
            return data;
        }

        asyncDB()
            .then(groupHandlers.setState)
            .catch(console.error);

    }, [groupList]);


    useEffect(() => {
        if (!db) return;
        const sub = liveQuery(
            () => db.table("groups").toArray()
        ).subscribe({
            next: rows => {
                const rowMap = Object.fromEntries(
                    rows.map(item => [item.id, item])
                );
                groupHandlers.setState(prev =>
                    prev.map(item => {
                        const local = rowMap[item.id];
                        if (!local || item.timestamp === local.timestamp) {
                            return item;
                        }
                        return { ...item, ...local };
                    })
                );
            },
            error: console.error,
        });
        return () => sub.unsubscribe();
    }, [db]);

    return (
        <GroupList
            groups={groupState}
            onSelect={openGroup}
            onAvatarClick={openGroupInfo}
        />
    );
}