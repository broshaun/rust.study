import { GroupMemberList } from "./UI/GroupMemberList"
import { useNavigate } from "react-router";
import { currentAppBar, useHttpClient, currentGroup } from "utils"
import { useEffect } from "react";
import { useLocalStorage } from '@mantine/hooks';
import { useQuery } from "@tanstack/react-query";


export const GroupUsers = () => {
    const navigate = useNavigate();

    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        // setTitle('群聊');
        setLeftPath('/mobile/chat/group/msgs')
        setRightIcon(null)
        setRightPath(null)
    }, [])

    const { http } = useHttpClient('/rpc/chat/msg/group/')
    const [userId] = useLocalStorage({ key: 'savedAccount' })
    const curgroup = currentGroup((state) => state.current)
    const { data: members = [], isLoading, error, refetch } = useQuery
        (
            {
                queryKey: ["group_user_list", userId],
                queryFn: async () => {
                    const results = await http.requestBodyJson("group_user_list", { "group_id": curgroup?.id });
                    const { code, data, message } = results;
                    if (code !== 200) throw new Error(message);
                    return data || [];
                },
                staleTime: 1000 * 60 * 5, // 5分钟内认为缓存有效
                gcTime: 1000 * 60 * 30, // 缓存保留30分钟
                select: (data) =>
                    data.map((item) => ({
                        id: item.id,
                        user_id: item.user_id,
                        nikename: item.nikename,
                        ask_state: item.ask_state,
                        avatar_url: item.avatar_url,
                    }))
            }
        );

    // const members = [
    //     {
    //         "id": "6a1679a2195e658e1594d160",
    //         "user_id": "6a1678614ad4463c12acf445",
    //         "nikename": "Shaun",
    //         "ask_state": "agreed",
    //         "avatar_url": "ea4086dd1ec9a9baeff9af843dba75a0.jpg"
    //     }
    // ]

    return <div>
        <GroupMemberList
            members={members}
            onAddMember={() => navigate('/mobile/chat/group/addg/')}
            onRemoveMember={() => navigate('/mobile/chat/group/delgusr/')}
        />
    </div>

}