import { GroupMemberList } from "./ui/GroupMemberList"
import { useNavigate } from "react-router";
import { currentAppBar, useHttpClient, currentChat } from "utils"
import { useEffect } from "react";
import { useLocalStorage } from '@mantine/hooks';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLoginUserInfo } from "http/login";

export const GroupUsers = () => {
    const navigate = useNavigate();
    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);
    const setRightPath = currentAppBar((state) => state.setRightPath);
    useEffect(() => {
        setTitle('群成员');
        setLeftPath('/mobile/chat/group/msgs')
        setRightIcon(null)
        setRightPath(null)
    }, [])

    const { http } = useHttpClient('/rpc/chat/msg/group/')
    const [userId] = useLocalStorage({ key: 'current_account' })
    const {data:currentUser} = useLoginUserInfo()
    const { data: members = [] } = useQuery
        (
            {
                queryKey: ["group_user_list", userId],
                queryFn: async () => {
                    const {id:groupId} = currentChat.getState().get('group')
                    const results = await http.requestBodyJson("group_user_list", { "group_id": groupId });
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
                        nickname: item.nickname,
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

    return <div>
        <GroupMemberList
            members={members}
            onAddMember={() => navigate('/mobile/chat/group/addgusr/')}
            onRemoveMember={() => navigate('/mobile/chat/group/delgusr/')}
            onExitGroup={() => {
                const id = members.find(item => item.user_id === currentUser?.id)?.id;
                leaveGroup({ id })
            }}
        />
    </div>

}