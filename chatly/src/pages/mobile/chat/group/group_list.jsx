import { useHttpClient, currentAppBar, currentGroup, useStoreGroup } from "utils";
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
    const setGroup = useStoreGroup((state) => state.setGroup);
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

    const syncGroups = useStoreGroup((state) => state.syncGroups);
    const getGroups = async () => {
        const results = await http.requestBodyJson("my_group_list");
        if (!results) throw new Error("获取失败");
        const { code, data, message } = results;
        if (code === 200){
            syncGroups(data)
        }
    }
    useQuery({
        queryKey: ["my_group_list", userId],
        queryFn: getGroups,
        staleTime: 1000 * 60 * 12,
        gcTime: 1000 * 3600 * 24,
        enabled: !!userId,
        refetchOnWindowFocus: false,
    });

    const navigate = useNavigate();
    const openGroup = (value) => {
        setCurGroup(value)
        setGroup(value?.id, { signal: "old" })
        navigate('/mobile/chat/group/msgs')
    }

    const openGroupInfo = (value) => {
        const list = value?.administrator || [];
        if (list.includes(currentUser?.id)) {
            setCurGroup(value)
            navigate('/mobile/chat/group/update')
        }
    }

    const groupState = useStoreGroup((state) => state.groups);
    // console.log('groupState++',groupState)
    return <GroupList
        groups={groupState}
        onSelect={openGroup}
        onAvatarClick={openGroupInfo}
    />
}