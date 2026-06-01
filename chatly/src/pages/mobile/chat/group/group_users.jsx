import { GroupMemberList } from "./UI/GroupMemberList"
import { useNavigate } from "react-router";
import { currentAppBar, useHttpClient, currentGroup } from "utils"
import { useEffect } from "react";
import { useLocalStorage } from '@mantine/hooks';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


export const GroupUsers = () => {
    const navigate = useNavigate();

    // const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        // setTitle('群聊');
        setLeftPath('/mobile/chat/group/msgs')
        setRightIcon(null)
        setRightPath(null)
    }, [])


    const current_group = currentGroup((state) => state.current)
    const { http } = useHttpClient('/rpc/chat/msg/group/')
    const [userId] = useLocalStorage({ key: 'current_account' })
    const [currentUser, setCurrentUser] = useLocalStorage({ key: 'current_user' })
    const { data: members = [], isLoading, error, refetch } = useQuery
        (
            {
                queryKey: ["group_user_list", userId],
                queryFn: async () => {
                    const results = await http.requestBodyJson("group_user_list", { "group_id": current_group?.id });
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

    const queryClient = useQueryClient();
    const { mutateAsync: leaveGroup } = useMutation({
        mutationFn: async ({ id }) => {
            const results = await http.requestBodyJson('group_ask_state', { id, ask_state: 'leave' })
            const { code, message, data } = results;
            if (code !== 200) {
                throw new Error(message);
            }
            return data;
        },
        onSuccess: (data) => {
            console.log(data);
            queryClient.invalidateQueries({ queryKey: ["my_group_list", userId] }).then(() => {
                navigate('/mobile/chat/group/');
            })
        },
        onError: (error) => {
            console.error(error);
        },
    });
    // console.log('members',members)
    return <div>
        <GroupMemberList
            members={members}
            onAddMember={() => navigate('/mobile/chat/group/addgusr/')}
            onRemoveMember={() => navigate('/mobile/chat/group/delgusr/')}
            onExitGroup={() => {
                // console.log("退出群聊:");
                // console.log('current_group?.id ',current_group )
                // console.log('currentUser',currentUser)
                const id = members.find(item => item.user_id === currentUser?.id)?.id;
                leaveGroup({ id })
            }}
        />
    </div>

}