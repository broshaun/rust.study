import { useHttpClient, currentAppBar, currentChat, groupStore } from "utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useLocalStorage } from '@mantine/hooks';
import { IconMailExclamation } from "@tabler/icons-react";
import { GroupList } from "./UI/GroupList";



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
        groupStore.getState().set(value?.id, { signal: "old", unread: 0 });
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

    const [userId] = useLocalStorage({ key: 'current_account' })
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
    const groupsMap = groupStore((state) => state.groups);
    const finalGroups = useMemo(() => {
        if (!isSuccess) return;
        return groupList.map(g => ({
            ...g,
            ...groupsMap.get(g.id)
        }));
    }, [groupList, groupsMap, isSuccess]);

    // console.log('groupList', groupList)
    // console.log('finalGroups', finalGroups)

    return (
        <GroupList
            groups={finalGroups}
            onSelect={openGroup}
            onAvatarClick={openGroupInfo}
        />
    );
}