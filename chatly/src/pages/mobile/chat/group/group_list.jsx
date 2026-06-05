import { useHttpClient, currentAppBar, currentGroup, groupStore } from "utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
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
    const { data: groupList = [] } = useQuery({
        queryKey: ["my_group_list", userId],
        queryFn: async () => {
            const results = await http.requestBodyJson("my_group_list", {});
            if (!results) throw new Error("获取失败");
            console.log('results', results)
            const { code, data, message } = results;
            if (code !== 200) {
                throw new Error(message || "获取群列表失败");
            }
            return data || [];
        },
        staleTime: 1000 * 60 * 12,
        gcTime: 1000 * 3600 * 24,
        enabled: !!userId,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        groupStore.sync(groupList)
    }, [groupList]);

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

    const groupState = groupStore.getList()
    console.log('groupState++', groupState)
    
    return <GroupList
        groups={groupState}
        onSelect={openGroup}
        onAvatarClick={openGroupInfo}
    />
}