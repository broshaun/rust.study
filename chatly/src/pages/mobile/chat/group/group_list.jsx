import { useHttpClient, currentAppBar, currentChat, getUserDB } from "utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect} from "react";
import { useNavigate } from "react-router";
import { useLocalStorage } from '@mantine/hooks';
import { IconMailExclamation } from "@tabler/icons-react";
import { GroupList } from "./UI/GroupList";
import { useLiveQuery } from "dexie-react-hooks";


export const Item = () => {
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
        setRightIcon(<IconMailExclamation />)
        setRightPath('/mobile/chat/group/ingmsg/')
    }, [])


    const navigate = useNavigate();
    // 打开群聊
    const openGroup = (value) => {
        currentChat.getState().set('group', { id: value?.id, name: value?.group_name })
        db.table("groups").update(value?.id, { signal: 'old', unread: 0 })
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

    const finalGroups = useLiveQuery(() => {
        if (!db) return;
        return db.table("groups").where("is_delete").equals(0).toArray();
    }, [db],[]);

    return (
        <GroupList
            groups={finalGroups}
            onSelect={openGroup}
            onAvatarClick={openGroupInfo}
        />
    );
}