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
    const [userId] = useLocalStorage({ key: 'current_account' })
    const [currentUser, setCurrentUser] = useLocalStorage({ key: 'current_user' });
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

    const { http } = useHttpClient('/rpc/chat/msg/group/')
    const { data: groups = [] } = useQuery
        ({
            queryKey: ["my_group_list", userId],
            queryFn: async () => {
                const results = await http.requestBodyJson("my_group_list");
                if (!results) throw new Error("获取失败");
                const { code, data, message } = results;
                if (code !== 200) throw new Error(message);
                return data || [];
            },
            staleTime: 1000 * 60 * 5, // 5分钟内认为缓存有效
            gcTime: 1000 * 60 * 30, // 缓存保留30分钟
            select: (data) =>
                data.map((item) => ({
                    id: item.id,
                    group_name: item.group_name,
                    group_avatar: item.group_avatar,
                    group_notice: item.group_notice,
                    administrator: item.administrator,
                    updated_at: item.updated_at,
                    admin_invite_only: item.admin_invite_only,
                }))
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
            console.log("是管理员");
            setCurGroup(value)
            navigate('/mobile/chat/group/update')
        }

    }

    const syncGroups = useStoreGroup((state) => state.syncGroups);
    useEffect(() => {
        syncGroups(groups)
    }, [groups]);

    const groupState = useStoreGroup((state) => state.groups);


    return <GroupList
        groups={groupState}
        onSelect={openGroup}
        onAvatarClick={openGroupInfo}
    />
}