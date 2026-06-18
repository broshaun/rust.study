import { GroupMemberList } from "./ui/GroupMemberList"
import { useNavigate } from "react-router";
import { currentAppBar, createHttpClient, currentChat } from "utils"
import { useEffect } from "react";
import { useLocalStorage } from '@mantine/hooks';
import { loginCache } from "http/loginCache";
import { agroup_user } from "http/group_user";
import { useQueryCache } from "http/useQueryCache";

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

    const { http } = createHttpClient('/rpc/chat/msg/group/')
    const [userId] = useLocalStorage({ key: 'current_account' })
    const currentUser = loginCache.get(userId)
    const { data: members = [] } = useQueryCache(agroup_user,userId)

    const leaveGroup = async ({ id }) => {
        const results = await http.requestBodyJson('group_ask_state', { id, ask_state: 'leave' })
        const { code, message, data } = results;
        if (code !== 200) {
            throw new Error(message);
        }
        await agroup_user.refresh(userId)
        navigate('/mobile/chat/group/');
        return data;
    }


    return <div>
        <GroupMemberList
            members={members}
            onAddMember={() => navigate('/mobile/chat/group/addgusr/')}
            onRemoveMember={() => navigate('/mobile/chat/group/delgusr/')}
            onExitGroup={() => {
                const id = members.find(item => item.uid === currentUser?.id)?.id;
                leaveGroup({ id })
            }}
        />
    </div>

}